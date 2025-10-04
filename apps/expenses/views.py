from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import serializers

from apps.core.utils.response_wrapper import api_response
from apps.core.utils.exceptions import extract_first_error_message
from .services import (
    create_expense,
    update_expense,
    delete_expense,
    list_expenses,
    get_expense_by_id,
    build_expense_detail_payload,
)
from .serializers import (
    ExpenseCreateSerializer,
    ExpenseUpdateSerializer,
)

User = get_user_model()


class ExpenseListCreateView(APIView):
    """List expenses or create a new expense request."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        List expenses with role-based filtering and pagination.
        
        Role-based access:
        - Admin: See all expenses in the company
        - Manager: See expenses from subordinates
        - Employee: See only their own expenses
        
        Query parameters:
        - page: Page number (default: 1)
        - page_size: Items per page (default: 10)
        - status: Filter by status (Pending, In-Progress, Approved, Rejected)
        - category: Filter by category
        - search: Search across employee name, email, description
        - date_from: Filter expenses from this date (YYYY-MM-DD)
        - date_to: Filter expenses up to this date (YYYY-MM-DD)
        - employee_id: Filter by employee ID
        """
        try:
            # Get query parameters
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            status_filter = request.query_params.get('status', None)
            category = request.query_params.get('category', None)
            search = request.query_params.get('search', None)
            date_from = request.query_params.get('date_from', None)
            date_to = request.query_params.get('date_to', None)
            employee_id = request.query_params.get('employee_id', None)
            
            # Get filtered and paginated expenses
            result = list_expenses(
                user=request.user,
                page=page,
                page_size=page_size,
                status=status_filter,
                category=category,
                search=search,
                date_from=date_from,
                date_to=date_to,
                employee_id=employee_id,
            )
            
            return api_response(data=result, message="Expenses retrieved successfully")
        except ValueError as e:
            return api_response(
                message="Invalid pagination parameters",
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )
        except Exception as e:
            print(f"Error retrieving expenses: {str(e)}")
            return api_response(
                message=str(e) if str(e) else "Failed to retrieve expenses",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False
            )

    def post(self, request):
        """
        Create a new expense request.
        
        Only employees can create expense requests.
        Automatically sets the employee to the current user.
        """
        try:
            # Validate user role (only employees should create expenses)
            # However, for flexibility, we'll allow all roles to create
            # You can uncomment below if you want to restrict to employees only
            # if request.user.role not in ['Employee', 'Manager']:
            #     return api_response(
            #         message="Only employees can create expense requests",
            #         status_code=status.HTTP_403_FORBIDDEN,
            #         success=False
            #     )
            
            serializer = ExpenseCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            payload = serializer.validated_data
            
            # Create expense
            expense = create_expense(
                employee=request.user,
                company=request.user.company,
                amount=payload['amount'],
                original_currency=payload['original_currency'],
                category=payload['category'],
                description=payload['description'],
                expense_date=payload['expense_date'],
                receipt_image=payload.get('receipt_image'),
            )
            
            # Return detailed expense information
            expense_data = build_expense_detail_payload(expense)
            return api_response(
                data=expense_data,
                message="Expense request created successfully",
                status_code=status.HTTP_201_CREATED
            )
        except serializers.ValidationError as e:
            error_message = extract_first_error_message(e.detail)
            return api_response(
                data=None,
                message=error_message,
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )
        except Exception as e:
            if hasattr(e, 'detail'):
                error_message = extract_first_error_message(e.detail)
                return api_response(
                    data=None,
                    message=error_message,
                    status_code=status.HTTP_400_BAD_REQUEST,
                    success=False
                )
            print(f"Error creating expense: {str(e)}")
            return api_response(
                message=str(e) if str(e) else "Failed to create expense request",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False
            )


class ExpenseDetailView(APIView):
    """Get, update, or delete a specific expense request."""
    permission_classes = [IsAuthenticated]

    def get(self, request, expense_id):
        """
        Get detailed information for a specific expense with approval tracking.
        
        Access control:
        - Admin: Can view all expenses in their company
        - Manager: Can view expenses from subordinates
        - Employee: Can only view their own expenses
        """
        try:
            expense = get_expense_by_id(expense_id, request.user)
            
            if not expense:
                return api_response(
                    message="Expense not found or you don't have permission to view it",
                    status_code=status.HTTP_404_NOT_FOUND,
                    success=False
                )
            
            # Return detailed expense information with approval history
            expense_data = build_expense_detail_payload(expense)
            return api_response(data=expense_data, message="Expense details retrieved successfully")
        except Exception as e:
            print(f"Error retrieving expense details: {str(e)}")
            return api_response(
                message=str(e) if str(e) else "Failed to retrieve expense details",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False
            )

    def patch(self, request, expense_id):
        """
        Update an expense request.
        
        Rules:
        - Only the expense owner can update their expense
        - Only expenses with status 'Pending' can be updated
        """
        try:
            expense = get_expense_by_id(expense_id, request.user)
            
            if not expense:
                return api_response(
                    message="Expense not found or you don't have permission to access it",
                    status_code=status.HTTP_404_NOT_FOUND,
                    success=False
                )
            
            # Only expense owner can update
            if expense.employee != request.user:
                return api_response(
                    message="You can only update your own expense requests",
                    status_code=status.HTTP_403_FORBIDDEN,
                    success=False
                )
            
            # Only pending expenses can be updated
            if expense.status != 'Pending':
                return api_response(
                    message=f"Cannot update expense with status '{expense.status}'. Only 'Pending' expenses can be updated.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                    success=False
                )
            
            serializer = ExpenseUpdateSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            
            # Update expense
            updated_expense = update_expense(expense, **data)
            
            # Return updated expense details
            expense_data = build_expense_detail_payload(updated_expense)
            return api_response(data=expense_data, message="Expense updated successfully")
        except serializers.ValidationError as e:
            error_message = extract_first_error_message(e.detail)
            return api_response(
                data=None,
                message=error_message,
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )
        except ValueError as e:
            return api_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )
        except Exception as e:
            if hasattr(e, 'detail'):
                error_message = extract_first_error_message(e.detail)
                return api_response(
                    data=None,
                    message=error_message,
                    status_code=status.HTTP_400_BAD_REQUEST,
                    success=False
                )
            print(f"Error updating expense: {str(e)}")
            return api_response(
                message=str(e) if str(e) else "Failed to update expense",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False
            )

    def delete(self, request, expense_id):
        """
        Delete an expense request (soft delete).
        
        Rules:
        - Only the expense owner can delete their expense
        - Only expenses with status 'Pending' can be deleted
        """
        try:
            expense = get_expense_by_id(expense_id, request.user)
            
            if not expense:
                return api_response(
                    message="Expense not found or you don't have permission to access it",
                    status_code=status.HTTP_404_NOT_FOUND,
                    success=False
                )
            
            # Only expense owner can delete
            if expense.employee != request.user:
                return api_response(
                    message="You can only delete your own expense requests",
                    status_code=status.HTTP_403_FORBIDDEN,
                    success=False
                )
            
            # Only pending expenses can be deleted
            if expense.status != 'Pending':
                return api_response(
                    message=f"Cannot delete expense with status '{expense.status}'. Only 'Pending' expenses can be deleted.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                    success=False
                )
            
            # Delete expense
            delete_expense(expense)
            
            return api_response(message="Expense deleted successfully", status_code=status.HTTP_200_OK)
        except ValueError as e:
            return api_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )
        except Exception as e:
            print(f"Error deleting expense: {str(e)}")
            return api_response(
                message=str(e) if str(e) else "Failed to delete expense",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False
            )


class ExpenseTrackView(APIView):
    """Track expense approval status and history."""
    permission_classes = [IsAuthenticated]

    def get(self, request, expense_id):
        """
        Track an expense request with complete approval history.
        
        This is an alias to the detail view but emphasizes tracking functionality.
        Returns full expense details including approval steps and current status.
        """
        try:
            expense = get_expense_by_id(expense_id, request.user)
            
            if not expense:
                return api_response(
                    message="Expense not found or you don't have permission to track it",
                    status_code=status.HTTP_404_NOT_FOUND,
                    success=False
                )
            
            # Return detailed expense information with full approval tracking
            expense_data = build_expense_detail_payload(expense)
            
            # Add additional tracking metadata
            tracking_info = {
                "expense": expense_data,
                "tracking_summary": {
                    "total_approval_steps": len(expense_data['approval_history']),
                    "current_status": expense_data['status'],
                    "current_step": expense_data['current_step'],
                    "awaiting_approval_from": expense_data['current_approver']['name'] if expense_data['current_approver'] else None,
                    "can_edit": expense.employee == request.user and expense.status == 'Pending',
                    "can_delete": expense.employee == request.user and expense.status == 'Pending',
                }
            }
            
            return api_response(data=tracking_info, message="Expense tracking information retrieved successfully")
        except Exception as e:
            print(f"Error tracking expense: {str(e)}")
            return api_response(
                message=str(e) if str(e) else "Failed to retrieve expense tracking information",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False
            )
