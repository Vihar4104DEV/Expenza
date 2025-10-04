from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.core.utils.response_wrapper import api_response
from apps.approvals.models import ApprovalWorkflow, WorkflowApprover, ExpenseApproval
from apps.approvals.serializers import (
    ApprovalWorkflowSerializer, ApprovalWorkflowCreateSerializer, ApprovalWorkflowUpdateSerializer,
    WorkflowApproverSerializer, WorkflowApproverCreateSerializer, WorkflowApproverUpdateSerializer,
    ExpenseApprovalSerializer, ApprovalDecisionSerializer, WorkflowReorderSerializer
)
from apps.approvals.services import ApprovalWorkflowService, ExpenseApprovalService


class ApprovalWorkflowViewSet(viewsets.ModelViewSet):
    """ViewSet for ApprovalWorkflow model"""
    queryset = ApprovalWorkflow.objects.all()
    serializer_class = ApprovalWorkflowSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rule_type', 'is_default', 'is_active']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ApprovalWorkflowCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ApprovalWorkflowUpdateSerializer
        return ApprovalWorkflowSerializer
    
    def get_queryset(self):
        """Filter workflows based on user's company"""
        if not self.request.user.is_authenticated:
            return ApprovalWorkflow.objects.none()
        
        return ApprovalWorkflow.objects.filter(company=self.request.user.company)
    
    def perform_create(self, serializer):
        """Create workflow with proper company assignment"""
        serializer.save(company=self.request.user.company)
    
    @action(detail=True, methods=['post'])
    def add_approver(self, request, pk=None):
        """Add an approver to the workflow"""
        try:
            workflow = self.get_object()
            approver_data = request.data
            approver_data['workflow'] = workflow.id
            
            serializer = WorkflowApproverCreateSerializer(data=approver_data)
            
            if serializer.is_valid():
                serializer.save()
                return api_response(data=serializer.data, message="Approver added successfully", status_code=201)
            
            return api_response(message="Validation Error", error=serializer.errors, status_code=400)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=True, methods=['put'])
    def update_approvers(self, request, pk=None):
        """Update all approvers for the workflow"""
        try:
            workflow = self.get_object()
            approvers_data = request.data.get('approvers', [])
            
            ApprovalWorkflowService.update_workflow_approvers(workflow, approvers_data)
            
            # Return updated workflow
            serializer = ApprovalWorkflowSerializer(workflow)
            return api_response(data=serializer.data, message="Workflow approvers updated successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=True, methods=['post'])
    def reorder_approvers(self, request, pk=None):
        """Reorder approvers in the workflow"""
        try:
            workflow = self.get_object()
            serializer = WorkflowReorderSerializer(data=request.data)
            
            if serializer.is_valid():
                ApprovalWorkflowService.reorder_approvers(
                    workflow, 
                    serializer.validated_data['approver_orders']
                )
                return api_response(message="Approvers reordered successfully")
            
            return api_response(message="Validation Error", error=serializer.errors, status_code=400)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set workflow as default for the company"""
        try:
            workflow = self.get_object()
            
            ApprovalWorkflowService.set_default_workflow(
                request.user.company, workflow
            )
            return api_response(message="Workflow set as default")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get workflow statistics"""
        try:
            workflow = self.get_object()
            stats = ApprovalWorkflowService.get_workflow_statistics(workflow)
            return api_response(data=stats, message="Workflow statistics retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['get'])
    def default(self, request):
        """Get default workflow for the company"""
        try:
            workflow = ApprovalWorkflow.objects.filter(
                company=request.user.company,
                is_default=True
            ).first()
            
            if workflow:
                serializer = ApprovalWorkflowSerializer(workflow)
                return api_response(data=serializer.data, message="Default workflow retrieved successfully")
            else:
                return api_response(
                    message="No default workflow found",
                    status_code=404
                )
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


class WorkflowApproverViewSet(viewsets.ModelViewSet):
    """ViewSet for WorkflowApprover model"""
    queryset = WorkflowApprover.objects.all()
    serializer_class = WorkflowApproverSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['workflow', 'approver', 'sequence']
    ordering_fields = ['sequence', 'created_at']
    ordering = ['sequence']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WorkflowApproverCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return WorkflowApproverUpdateSerializer
        return WorkflowApproverSerializer
    
    def get_queryset(self):
        """Filter approvers based on user's company workflows"""
        if not self.request.user.is_authenticated:
            return WorkflowApprover.objects.none()
        
        return WorkflowApprover.objects.filter(
            workflow__company=self.request.user.company
        )


class ExpenseApprovalViewSet(viewsets.ModelViewSet):
    """ViewSet for ExpenseApproval model"""
    queryset = ExpenseApproval.objects.all()
    serializer_class = ExpenseApprovalSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['expense', 'approver', 'decision', 'step_number']
    ordering_fields = ['step_number', 'created_at', 'decided_at']
    ordering = ['step_number', 'created_at']
    
    def get_queryset(self):
        """Filter approvals based on user permissions"""
        if not self.request.user.is_authenticated:
            return ExpenseApproval.objects.none()
        
        # Admin can see all approvals in their company
        if self.request.user.role == 'Admin':
            return ExpenseApproval.objects.filter(
                expense__company=self.request.user.company
            )
        
        # Manager can see approvals for their team
        elif self.request.user.role == 'Manager':
            from apps.users.services import get_user_subordinates
            subordinates = get_user_subordinates(self.request.user)
            return ExpenseApproval.objects.filter(
                Q(expense__employee__in=subordinates) | Q(approver=self.request.user)
            )
        
        # Employee can only see their own expense approvals
        else:
            return ExpenseApproval.objects.filter(expense__employee=self.request.user)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending approvals for current user"""
        try:
            pending_approvals = ExpenseApprovalService.get_pending_approvals_for_user(
                request.user
            )
            serializer = ExpenseApprovalSerializer(pending_approvals, many=True)
            return api_response(data=serializer.data, message="Pending approvals retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=True, methods=['post'])
    def decide(self, request, pk=None):
        """Make an approval decision"""
        try:
            approval = self.get_object()
            serializer = ApprovalDecisionSerializer(data=request.data)
            
            if serializer.is_valid():
                ExpenseApprovalService.process_approval_decision(
                    approval.id,
                    serializer.validated_data['decision'],
                    serializer.validated_data.get('comments', '')
                )
                
                # Return updated approval
                approval.refresh_from_db()
                serializer = ExpenseApprovalSerializer(approval)
                return api_response(data=serializer.data, message="Approval decision processed successfully")
            
            return api_response(message="Validation Error", error=serializer.errors, status_code=400)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=True, methods=['post'])
    def escalate(self, request, pk=None):
        """Escalate an approval"""
        try:
            approval = self.get_object()
            escalated_to_id = request.data.get('escalated_to')
            reason = request.data.get('reason', '')
            
            if not escalated_to_id:
                return api_response(
                    message='escalated_to is required',
                    status_code=400
                )
            
            from apps.users.models import User
            escalated_to = User.objects.get(
                id=escalated_to_id,
                company=approval.expense.company,
                role__in=['Admin', 'Manager']
            )
            
            escalation = ExpenseApprovalService.escalate_approval(
                approval.expense, escalated_to, reason
            )
            
            serializer = ExpenseApprovalSerializer(escalation)
            return api_response(data=serializer.data, message="Approval escalated successfully")
        except User.DoesNotExist:
            return api_response(
                message='Escalation target not found',
                status_code=400
            )
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get approval statistics for the company"""
        try:
            stats = ExpenseApprovalService.get_approval_statistics(request.user.company)
            return api_response(data=stats, message="Approval statistics retrieved successfully")
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get approval history for a specific expense"""
        try:
            expense_id = request.query_params.get('expense_id')
            
            if not expense_id:
                return api_response(
                    message='expense_id parameter is required',
                    status_code=400
                )
            
            from apps.expenses.models import Expense
            expense = Expense.objects.get(
                id=expense_id,
                company=request.user.company
            )
            
            # Check permissions
            if (request.user.role == 'Employee' and expense.employee != request.user) or \
               (request.user.role == 'Manager' and expense.employee.manager != request.user):
                return api_response(
                    message='You are not authorized to view this expense',
                    status_code=403
                )
            
            history = ExpenseApprovalService.get_approval_history_for_expense(expense)
            serializer = ExpenseApprovalSerializer(history, many=True)
            return api_response(data=serializer.data, message="Approval history retrieved successfully")
        except Expense.DoesNotExist:
            return api_response(
                message='Expense not found',
                status_code=404
            )
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
