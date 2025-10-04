from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import serializers
from rest_framework import viewsets
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.core.utils.response_wrapper import api_response
from apps.core.utils.exceptions import extract_first_error_message
from apps.users.services import (
    create_user,
    update_user,
    delete_user,
    set_user_active,
    list_users,
    get_user_by_id,
    build_user_payload,
    build_user_list_payload,
    get_user_detail_payload,
    get_user_subordinates,
    get_user_team_expenses,
    get_approvers_for_company,
    get_user_pending_approvals,
    update_user_role,
)
from .serializers import (
    UserCreateSerializer,
    UserUpdateSerializer,
    UserDetailSerializer,
    UserSerializer,
    UserPasswordChangeSerializer,
    UserListSerializer,
)

User = get_user_model()


def _is_admin(user: User) -> bool:
    return getattr(user, 'role', None) == 'Admin'


class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to view users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            # Get query parameters for pagination, filtering, and search
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            department = request.query_params.get('department', None)
            role = request.query_params.get('role', None)
            search = request.query_params.get('search', None)
            is_active = request.query_params.get('is_active', None)
            
            # Get filtered and paginated users
            result = list_users(
                company=request.user.company,
                page=page,
                page_size=page_size,
                department=department,
                role=role,
                search=search,
                is_active=is_active
            )
            
            return api_response(data=result, message="Users retrieved successfully")
        except ValueError as e:
            return api_response(message="Invalid pagination parameters", status_code=status.HTTP_400_BAD_REQUEST, success=False)
        except Exception as e:
            print(f"Error retrieving users: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to retrieve users", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)

    def post(self, request):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to create users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            serializer = UserCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            payload = serializer.validated_data
            
            manager = None
            manager_id = payload.get('manager_id')
            if manager_id:
                try:
                    manager = User.objects.get(id=manager_id, company=request.user.company)
                except User.DoesNotExist:
                    return api_response(message="Manager not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            user = create_user(
                company=request.user.company,
                name=payload['name'],
                email=payload['email'],
                role=payload['role'],
                password=payload.get('password'),
                manager=manager,
                department=payload.get('department')
            )
            return api_response(data=build_user_payload(user), message="User created successfully", status_code=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            error_message = extract_first_error_message(e.detail)
            return api_response(data=None, message=error_message, status_code=status.HTTP_400_BAD_REQUEST, success=False)
        except Exception as e:
            if hasattr(e, 'detail'):
                error_message = extract_first_error_message(e.detail)
                return api_response(data=None, message=error_message, status_code=status.HTTP_400_BAD_REQUEST, success=False)
            print(f"Error creating user: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to create user", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to view user details", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            try:
                user = User.objects.select_related('company', 'manager').get(id=user_id, company=request.user.company)
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            # Return detailed user information
            data = get_user_detail_payload(user)
            return api_response(data=data, message="User details retrieved successfully")
        except Exception as e:
            print(f"Error retrieving user details: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to retrieve user details", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)

    def patch(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to update users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            try:
                target = User.objects.get(id=user_id, company=request.user.company)
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            serializer = UserUpdateSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            
            # Resolve manager if provided
            if 'manager_id' in data:
                manager_id = data.pop('manager_id')
                if manager_id:
                    try:
                        data['manager'] = User.objects.get(id=manager_id, company=request.user.company)
                    except User.DoesNotExist:
                        return api_response(message="Manager not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
                else:
                    data['manager'] = None
            
            updated = update_user(target, **data)
            return api_response(data=build_user_payload(updated), message="User updated successfully")
        except serializers.ValidationError as e:
            error_message = extract_first_error_message(e.detail)
            return api_response(data=None, message=error_message, status_code=status.HTTP_400_BAD_REQUEST, success=False)
        except Exception as e:
            if hasattr(e, 'detail'):
                error_message = extract_first_error_message(e.detail)
                return api_response(data=None, message=error_message, status_code=status.HTTP_400_BAD_REQUEST, success=False)
            print(f"Error updating user: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to update user", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)

    def delete(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to delete users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            try:
                target = User.objects.get(id=user_id, company=request.user.company)
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            # Soft delete via model's delete()
            target.delete()
            return api_response(message="User deleted successfully", status_code=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error deleting user: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to delete user", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)


class UserActivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to activate users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            try:
                target = User.objects.get(id=user_id, company=request.user.company)
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            set_user_active(target, True)
            return api_response(message="User activated successfully")
        except Exception as e:
            print(f"Error activating user: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to activate user", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)


class UserDeactivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to deactivate users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            try:
                target = User.objects.get(id=user_id, company=request.user.company)
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            set_user_active(target, False)
            return api_response(message="User deactivated")
        except Http404:
            return api_response(message="User not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


# Additional views for approval system
class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model with approval system features"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'department', 'is_manager_approver', 'is_active']
    search_fields = ['name', 'email', 'employee_id']
    ordering_fields = ['name', 'email', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'change_password':
            return UserPasswordChangeSerializer
        elif self.action == 'list':
            return UserListSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Filter users based on user's company and permissions"""
        if not self.request.user.is_authenticated:
            return User.objects.none()
        
        # Admin can see all users in their company
        if self.request.user.role == 'Admin':
            return User.objects.filter(company=self.request.user.company)
        
        # Manager can see their subordinates
        elif self.request.user.role == 'Manager':
            return User.objects.filter(
                company=self.request.user.company,
                manager=self.request.user
            )
        
        # Employee can only see themselves
        else:
            return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user details"""
        try:
            serializer = UserSerializer(request.user)
            return api_response(data=serializer.data, message="User details retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['put'])
    def change_password(self, request):
        """Change user password"""
        try:
            serializer = UserPasswordChangeSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                from apps.users.services import change_password
                change_password(request.user, serializer.validated_data['new_password'])
                return api_response(message="Password changed successfully")
            
            return api_response(message="Validation Error", error=serializer.errors, status_code=400)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['get'])
    def subordinates(self, request):
        """Get user's subordinates"""
        try:
            subordinates = get_user_subordinates(request.user)
            serializer = UserListSerializer(subordinates, many=True)
            return api_response(data=serializer.data, message="Subordinates retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['get'])
    def team_expenses(self, request):
        """Get team expenses"""
        try:
            expenses = get_user_team_expenses(request.user)
            
            from apps.expenses.serializers import ExpenseListSerializer
            serializer = ExpenseListSerializer(expenses, many=True)
            return api_response(data=serializer.data, message="Team expenses retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get pending approvals for user"""
        try:
            if request.user.role not in ['Admin', 'Manager']:
                return api_response(
                    message='Only Admin and Manager can view pending approvals',
                    status_code=403
                )
            
            pending_expenses = get_user_pending_approvals(request.user)
            
            from apps.expenses.serializers import ExpenseApprovalSerializer
            serializer = ExpenseApprovalSerializer(pending_expenses, many=True)
            return api_response(data=serializer.data, message="Pending approvals retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=True, methods=['put'])
    def update_role(self, request, pk=None):
        """Update user role and manager"""
        try:
            user = self.get_object()
            new_role = request.data.get('role')
            manager_id = request.data.get('manager')
            
            if not new_role:
                return api_response(
                    message='Role is required',
                    status_code=400
                )
            
            manager = None
            if manager_id:
                try:
                    manager = User.objects.get(id=manager_id, company=user.company)
                except User.DoesNotExist:
                    return api_response(
                        message='Manager not found',
                        status_code=400
                    )
            
            updated_user = update_user_role(user, new_role, manager)
            serializer = UserSerializer(updated_user)
            return api_response(data=serializer.data, message="User role updated successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['get'])
    def approvers(self, request):
        """Get all approvers for the company"""
        try:
            approvers = get_approvers_for_company(request.user.company)
            serializer = UserListSerializer(approvers, many=True)
            return api_response(data=serializer.data, message="Approvers retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)