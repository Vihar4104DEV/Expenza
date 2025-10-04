from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
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
from apps.users.services import (
    create_user,
    update_user,
    delete_user,
    set_user_active,
    list_users,
    get_user_by_id,
    build_user_payload,
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
                return api_response(message="Forbidden", status_code=403)
            users = list_users(request.user.company)
            data = [build_user_payload(u) for u in users]
            return api_response(data=data)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)

    def post(self, request):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            serializer = UserCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            payload = serializer.validated_data
            manager = None
            manager_id = payload.get('manager_id')
            if manager_id:
                manager = get_object_or_404(User, id=manager_id, company=request.user.company)
            user = create_user(
                company=request.user.company,
                name=payload['name'],
                email=payload['email'],
                employee_id=payload['employee_id'],
                role=payload['role'],
                password=payload.get('password'),
                manager=manager,
            )
            return api_response(data=build_user_payload(user), message="User created", status_code=201)
        except serializers.ValidationError as e:
            return api_response(message="Validation Error", error=e.detail, status_code=400)
        except Http404:
            return api_response(message="Manager not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            user = get_object_or_404(User, id=user_id, company=request.user.company)
            return api_response(data=build_user_payload(user))
        except Http404:
            return api_response(message="User not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)

    def patch(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            target = get_object_or_404(User, id=user_id, company=request.user.company)
            serializer = UserUpdateSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            # Resolve manager if provided
            if 'manager_id' in data:
                manager_id = data.pop('manager_id')
                data['manager'] = get_object_or_404(User, id=manager_id, company=request.user.company) if manager_id else None
            updated = update_user(target, **data)
            return api_response(data=build_user_payload(updated), message="User updated")
        except serializers.ValidationError as e:
            return api_response(message="Validation Error", error=e.detail, status_code=400)
        except Http404:
            return api_response(message="User or Manager not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)

    def delete(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            target = get_object_or_404(User, id=user_id, company=request.user.company)
            # Soft delete via model's delete()
            target.delete()
            return api_response(message="User deleted (soft)", status_code=204)
        except Http404:
            return api_response(message="User not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


class UserActivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            target = get_object_or_404(User, id=user_id, company=request.user.company)
            set_user_active(target, True)
            return api_response(message="User activated")
        except Http404:
            return api_response(message="User not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


class UserDeactivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            target = get_object_or_404(User, id=user_id, company=request.user.company)
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