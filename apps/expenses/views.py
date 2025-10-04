from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q

from apps.approvals.models import ExpenseApproval
from apps.core.utils.response_wrapper import api_response
from apps.expenses.models import Expense
from apps.users.services import (
    get_user_subordinates,
    get_user_team_expenses,
    get_user_pending_approvals,
    get_approvers_for_company,
    update_user_role
)
from apps.users.models import User
from apps.expenses.serializers import (
    ExpenseSerializer, ExpenseCreateSerializer, ExpenseUpdateSerializer,
    ExpenseApprovalSerializer, ExpenseListSerializer, OCRReceiptSerializer
)
from apps.expenses.services import ExpenseService, CurrencyService


class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for Expense model"""
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category', 'original_currency', 'is_active']
    search_fields = ['description', 'employee__name', 'employee__email']
    ordering_fields = ['amount', 'expense_date', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ExpenseUpdateSerializer
        elif self.action == 'list':
            return ExpenseListSerializer
        return ExpenseSerializer
    
    def get_queryset(self):
        """Filter expenses based on user permissions"""
        if not self.request.user.is_authenticated:
            return Expense.objects.none()
        
        # Admin can see all expenses in their company
        if self.request.user.role == 'Admin':
            return Expense.objects.filter(company=self.request.user.company)
        
        # Manager can see their subordinates' expenses
        elif self.request.user.role == 'Manager':
            subordinates = get_user_subordinates(self.request.user)
            return Expense.objects.filter(
                Q(employee__in=subordinates) | Q(current_approver=self.request.user)
            )
        
        # Employee can only see their own expenses
        else:
            return Expense.objects.filter(employee=self.request.user)
    
    # def perform_create(self, serializer):
    #     """Create expense with proper company and employee assignment"""
    #     serializer.save(
    #         employee=self.request.user,
    #         company=self.request.user.company
    #     )
    
    def perform_create(self, serializer):
        """Create expense with proper company, employee assignment, and approver"""
        user = self.request.user
        
        # Determine the first approver based on user's configuration
        current_approver = None
        current_step = 0
        
        if user.is_manager_approver and user.manager:
            # If user has manager approval enabled and has a manager, assign them
            current_approver = user.manager
        else:
            # Otherwise, find a Manager role in the company
            # You might want to add additional logic here to determine which manager
            manager = User.objects.filter(
                company=user.company,
                role='Manager',
                is_active=True
            ).first()
            
            if manager:
                current_approver = manager
        
        # Save the expense with all required fields
        expense = serializer.save(
            employee=user,
            company=user.company,
            status='Pending',
            current_approver=current_approver,
            current_step=current_step
        )

        # Create initial ExpenseApproval record
        ExpenseApproval.objects.create(
            expense=expense,
            approver=current_approver,
            step_number=current_step,
            decision='Pending'
        )

    @action(detail=False, methods=['get'])
    def my_expenses(self, request):
        """Get current user's expenses"""
        try:
            expenses = Expense.objects.filter(employee=request.user)
            status_filter = request.query_params.get('status')
            
            if status_filter:
                expenses = expenses.filter(status=status_filter)
            
            serializer = ExpenseListSerializer(expenses, many=True)
            return api_response(data=serializer.data, message="Expenses retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get expenses pending approval by current user"""
        try:
            if request.user.role not in ['Admin', 'Manager']:
                return api_response(
                    message="Only Admin and Manager can view pending approvals",
                    status_code=403
                )
            
            pending_expenses = Expense.objects.filter(
                current_approver=request.user,
                status__in=['In-Progress', "Pending"]
            )
            
            serializer = ExpenseApprovalSerializer(pending_expenses, many=True)
            return api_response(data=serializer.data, message="Pending approvals retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve or reject an expense"""
        try:
            expense = self.get_object()
            decision = request.data.get('decision')
            comments = request.data.get('comments', '')
            
            if decision not in ['Approved', 'Rejected']:
                return api_response(
                    message='Decision must be either "Approved" or "Rejected"',
                    status_code=400
                )
            
            if expense.current_approver != request.user:
                return api_response(
                    message='You are not authorized to approve this expense',
                    status_code=403
                )
            
            ExpenseService.process_approval(expense, request.user, decision, comments)
            print("after expense service process approval")
            # Return updated expense
            serializer = ExpenseSerializer(expense)
            return api_response(data=serializer.data, message="Expense approval processed successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=True, methods=['post'])
    def escalate(self, request, pk=None):
        """Escalate an expense to a higher authority"""
        try:
            expense = self.get_object()
            escalated_to_id = request.data.get('escalated_to')
            reason = request.data.get('reason', '')
            
            if not escalated_to_id:
                return api_response(
                    message='escalated_to is required',
                    status_code=400
                )
            
            escalated_to = User.objects.get(
                id=escalated_to_id,
                company=expense.company,
                role__in=['Admin', 'Manager']
            )
            
            ExpenseService.escalate_expense(expense, escalated_to)
            
            serializer = ExpenseSerializer(expense)
            return api_response(data=serializer.data, message="Expense escalated successfully")
        except User.DoesNotExist:
            return api_response(
                message='Escalation target not found',
                status_code=400
            )
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=True, methods=['get'])
    def approval_history(self, request, pk=None):
        """Get approval history for an expense"""
        try:
            expense = self.get_object()
            
            # Check if user has permission to view this expense
            if (request.user.role == 'Employee' and expense.employee != request.user) or \
               (request.user.role == 'Manager' and expense.employee.manager != request.user):
                return api_response(
                    message='You are not authorized to view this expense',
                    status_code=403
                )
            
            history = ExpenseService.get_expense_approval_history(expense)
            
            from apps.approvals.serializers import ExpenseApprovalSerializer
            serializer = ExpenseApprovalSerializer(history, many=True)
            return api_response(data=serializer.data, message="Approval history retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get expenses by status"""
        try:
            status_filter = request.query_params.get('status')
            if not status_filter:
                return api_response(
                    message='status parameter is required',
                    status_code=400
                )
            
            expenses = ExpenseService.get_expenses_by_status(
                request.user.company, status_filter
            )
            
            # Apply user permission filtering
            if request.user.role == 'Manager':
                subordinates = get_user_subordinates(request.user)
                expenses = expenses.filter(employee__in=subordinates)
            elif request.user.role == 'Employee':
                expenses = expenses.filter(employee=request.user)
            
            serializer = ExpenseListSerializer(expenses, many=True)
            return api_response(data=serializer.data, message="Expenses retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['post'])
    def process_receipt(self, request):
        """Process receipt using OCR"""
        try:
            serializer = OCRReceiptSerializer(data=request.data)
            
            if serializer.is_valid():
                # Here you would integrate with your OCR service
                # For now, return mock data
                receipt_data = {
                    'amount': 25.50,
                    'date': '2024-01-15',
                    'merchant': 'Sample Restaurant',
                    'description': 'Business lunch meeting'
                }
                
                return api_response(data=receipt_data, message="Receipt processed successfully")
            
            return api_response(message="Validation Error", error=serializer.errors, status_code=400)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['get'])
    def currencies(self, request):
        """Get list of supported currencies"""
        try:
            currencies = CurrencyService.get_currency_list()
            return api_response(data=currencies, message="Currencies retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['post'])
    def convert_currency(self, request):
        """Convert currency"""
        try:
            amount = request.data.get('amount')
            from_currency = request.data.get('from_currency')
            to_currency = request.data.get('to_currency')
            
            if not all([amount, from_currency, to_currency]):
                return api_response(
                    message='amount, from_currency, and to_currency are required',
                    status_code=400
                )
            
            converted_amount = CurrencyService.convert_currency(
                amount, from_currency, to_currency
            )
            
            if converted_amount is None:
                return api_response(
                    message='Currency conversion failed',
                    status_code=400
                )
            
            return api_response(data={
                'original_amount': amount,
                'from_currency': from_currency,
                'converted_amount': converted_amount,
                'to_currency': to_currency
            }, message="Currency converted successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
