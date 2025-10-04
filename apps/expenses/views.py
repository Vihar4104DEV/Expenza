from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q

from apps.expenses.models import Expense
from apps.users.services import UserService
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
            subordinates = UserService.get_user_subordinates(self.request.user)
            return Expense.objects.filter(
                Q(employee__in=subordinates) | Q(current_approver=self.request.user)
            )
        
        # Employee can only see their own expenses
        else:
            return Expense.objects.filter(employee=self.request.user)
    
    def perform_create(self, serializer):
        """Create expense with proper company and employee assignment"""
        serializer.save(
            employee=self.request.user,
            company=self.request.user.company
        )
    
    @action(detail=False, methods=['get'])
    def my_expenses(self, request):
        """Get current user's expenses"""
        expenses = UserService.get_user_expenses(request.user)
        status_filter = request.query_params.get('status')
        
        if status_filter:
            expenses = expenses.filter(status=status_filter)
        
        serializer = ExpenseListSerializer(expenses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get expenses pending approval by current user"""
        if request.user.role not in ['Admin', 'Manager']:
            return Response(
                {'error': 'Only Admin and Manager can view pending approvals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending_expenses = Expense.objects.filter(
            current_approver=request.user,
            status='In-Progress'
        )
        
        serializer = ExpenseApprovalSerializer(pending_expenses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve or reject an expense"""
        expense = self.get_object()
        decision = request.data.get('decision')
        comments = request.data.get('comments', '')
        
        if decision not in ['Approved', 'Rejected']:
            return Response(
                {'error': 'Decision must be either "Approved" or "Rejected"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if expense.current_approver != request.user:
            return Response(
                {'error': 'You are not authorized to approve this expense'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            ExpenseService.process_approval(expense, request.user, decision, comments)
            
            # Return updated expense
            serializer = ExpenseSerializer(expense)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def escalate(self, request, pk=None):
        """Escalate an expense to a higher authority"""
        expense = self.get_object()
        escalated_to_id = request.data.get('escalated_to')
        reason = request.data.get('reason', '')
        
        if not escalated_to_id:
            return Response(
                {'error': 'escalated_to is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            escalated_to = User.objects.get(
                id=escalated_to_id,
                company=expense.company,
                role__in=['Admin', 'Manager']
            )
            
            ExpenseService.escalate_expense(expense, escalated_to)
            
            serializer = ExpenseSerializer(expense)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'Escalation target not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def approval_history(self, request, pk=None):
        """Get approval history for an expense"""
        expense = self.get_object()
        
        # Check if user has permission to view this expense
        if (request.user.role == 'Employee' and expense.employee != request.user) or \
           (request.user.role == 'Manager' and expense.employee.manager != request.user):
            return Response(
                {'error': 'You are not authorized to view this expense'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        history = ExpenseService.get_expense_approval_history(expense)
        
        from apps.approvals.serializers import ExpenseApprovalSerializer
        serializer = ExpenseApprovalSerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get expenses by status"""
        status_filter = request.query_params.get('status')
        if not status_filter:
            return Response(
                {'error': 'status parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        expenses = ExpenseService.get_expenses_by_status(
            request.user.company, status_filter
        )
        
        # Apply user permission filtering
        if request.user.role == 'Manager':
            subordinates = UserService.get_user_subordinates(request.user)
            expenses = expenses.filter(employee__in=subordinates)
        elif request.user.role == 'Employee':
            expenses = expenses.filter(employee=request.user)
        
        serializer = ExpenseListSerializer(expenses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def process_receipt(self, request):
        """Process receipt using OCR"""
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
            
            return Response(receipt_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def currencies(self, request):
        """Get list of supported currencies"""
        currencies = CurrencyService.get_currency_list()
        return Response(currencies)
    
    @action(detail=False, methods=['post'])
    def convert_currency(self, request):
        """Convert currency"""
        amount = request.data.get('amount')
        from_currency = request.data.get('from_currency')
        to_currency = request.data.get('to_currency')
        
        if not all([amount, from_currency, to_currency]):
            return Response(
                {'error': 'amount, from_currency, and to_currency are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        converted_amount = CurrencyService.convert_currency(
            amount, from_currency, to_currency
        )
        
        if converted_amount is None:
            return Response(
                {'error': 'Currency conversion failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'original_amount': amount,
            'from_currency': from_currency,
            'converted_amount': converted_amount,
            'to_currency': to_currency
        })
