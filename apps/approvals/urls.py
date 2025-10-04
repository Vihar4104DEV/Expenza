from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.approvals.views import (
    ApprovalWorkflowViewSet, 
    WorkflowApproverViewSet, 
    ExpenseApprovalViewSet
)
from apps.approvals.approval_apis import (
    create_workflow_with_approvers,
    bulk_approve_expenses,
    escalate_expense,
    get_approval_dashboard,
    reorder_workflow_approvers,
    get_workflow_analytics
)

router = DefaultRouter()
router.register(r'workflows', ApprovalWorkflowViewSet, basename='workflow')
router.register(r'workflow-approvers', WorkflowApproverViewSet, basename='workflow-approver')
router.register(r'approvals', ExpenseApprovalViewSet, basename='approval')

urlpatterns = [
    path('', include(router.urls)),
    
    # Specialized approval APIs
    path('workflows/create-with-approvers/', create_workflow_with_approvers, name='create-workflow-with-approvers'),
    path('approvals/bulk-approve/', bulk_approve_expenses, name='bulk-approve-expenses'),
    path('expenses/<uuid:expense_id>/escalate/', escalate_expense, name='escalate-expense'),
    path('dashboard/', get_approval_dashboard, name='approval-dashboard'),
    path('workflows/<uuid:workflow_id>/reorder-approvers/', reorder_workflow_approvers, name='reorder-workflow-approvers'),
    path('workflows/<uuid:workflow_id>/analytics/', get_workflow_analytics, name='workflow-analytics'),
]
