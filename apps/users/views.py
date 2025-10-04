from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.users.models import User
from apps.users.serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    UserPasswordChangeSerializer, UserListSerializer
)
from apps.users.services import UserService


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
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
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'])
    def change_password(self, request):
        """Change user password"""
        serializer = UserPasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def subordinates(self, request):
        """Get user's subordinates"""
        subordinates = UserService.get_user_subordinates(request.user)
        serializer = UserListSerializer(subordinates, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def team_expenses(self, request):
        """Get team expenses"""
        expenses = UserService.get_user_team_expenses(request.user)
        
        from apps.expenses.serializers import ExpenseListSerializer
        serializer = ExpenseListSerializer(expenses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get pending approvals for user"""
        if request.user.role not in ['Admin', 'Manager']:
            return Response(
                {'error': 'Only Admin and Manager can view pending approvals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending_expenses = UserService.get_user_pending_approvals(request.user)
        
        from apps.expenses.serializers import ExpenseApprovalSerializer
        serializer = ExpenseApprovalSerializer(pending_expenses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['put'])
    def update_role(self, request, pk=None):
        """Update user role and manager"""
        user = self.get_object()
        new_role = request.data.get('role')
        manager_id = request.data.get('manager')
        
        if not new_role:
            return Response(
                {'error': 'Role is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        manager = None
        if manager_id:
            try:
                manager = User.objects.get(id=manager_id, company=user.company)
            except User.DoesNotExist:
                return Response(
                    {'error': 'Manager not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            updated_user = UserService.update_user_role(user, new_role, manager)
            serializer = UserSerializer(updated_user)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def approvers(self, request):
        """Get all approvers for the company"""
        approvers = UserService.get_approvers_for_company(request.user.company)
        serializer = UserListSerializer(approvers, many=True)
        return Response(serializer.data)
