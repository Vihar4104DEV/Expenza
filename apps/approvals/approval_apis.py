from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import transaction

from apps.core.utils.response_wrapper import api_response
from apps.approvals.models import ApprovalWorkflow, WorkflowApprover, ExpenseApproval
from apps.expenses.models import Expense
from apps.users.models import User
from apps.approvals.serializers import (
    ApprovalWorkflowSerializer, WorkflowApproverSerializer,
    ExpenseApprovalSerializer, ApprovalDecisionSerializer
)
from apps.approvals.services import ApprovalWorkflowService, ExpenseApprovalService


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_workflow_with_approvers(request):
    """Create a workflow with multiple approvers in one request"""
    try:
        if request.user.role != 'Admin':
            return api_response(
                message='Only Admin can create workflows',
                status_code=403
            )
        
        workflow_data = request.data.get('workflow', {})
        approvers_data = request.data.get('approvers', [])
        
        # Validate workflow data
        ApprovalWorkflowService.validate_workflow(workflow_data)
        
        # Create workflow
        workflow_data['company'] = request.user.company
        workflow = ApprovalWorkflow.objects.create(**workflow_data)
        
        # Create approvers
        for approver_data in approvers_data:
            approver_data['workflow'] = workflow
            WorkflowApprover.objects.create(**approver_data)
        
        # Return created workflow with approvers
        serializer = ApprovalWorkflowSerializer(workflow)
        return api_response(data=serializer.data, message="Workflow created successfully", status_code=201)
        
    except Exception as e:
        return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_approve_expenses(request):
    """Bulk approve multiple expenses"""
    try:
        if request.user.role not in ['Admin', 'Manager']:
            return api_response(
                message='Only Admin and Manager can approve expenses',
                status_code=403
            )
        
        expense_ids = request.data.get('expense_ids', [])
        decision = request.data.get('decision', 'Approved')
        comments = request.data.get('comments', '')
        
        if not expense_ids:
            return api_response(
                message='expense_ids is required',
                status_code=400
            )
        
        if decision not in ['Approved', 'Rejected']:
            return api_response(
                message='Decision must be either "Approved" or "Rejected"',
                status_code=400
            )
        
        with transaction.atomic():
            approved_expenses = []
            failed_expenses = []
            
            for expense_id in expense_ids:
                try:
                    expense = Expense.objects.get(
                        id=expense_id,
                        current_approver=request.user,
                        status='In-Progress'
                    )
                    
                    from apps.expenses.services import ExpenseService
                    ExpenseService.process_approval(expense, request.user, decision, comments)
                    approved_expenses.append(expense_id)
                    
                except Expense.DoesNotExist:
                    failed_expenses.append({
                        'expense_id': expense_id,
                        'error': 'Expense not found or not pending your approval'
                    })
                except Exception as e:
                    failed_expenses.append({
                        'expense_id': expense_id,
                        'error': str(e)
                    })
            
            return api_response(data={
                'approved_expenses': approved_expenses,
                'failed_expenses': failed_expenses,
                'message': f'Processed {len(expense_ids)} expenses'
            }, message="Bulk approval processed successfully")
            
    except Exception as e:
        return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def escalate_expense(request, expense_id):
    """Escalate an expense to a higher authority"""
    try:
        expense = Expense.objects.get(
            id=expense_id,
            company=request.user.company
        )
        
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
        
        from apps.expenses.services import ExpenseService
        ExpenseService.escalate_expense(expense, escalated_to)
        
        # Create escalation record
        escalation = ExpenseApproval.objects.create(
            expense=expense,
            approver=escalated_to,
            step_number=expense.current_step + 1,
            decision='Pending',
            comments=f"Escalated by {request.user.name}: {reason}"
        )
        
        serializer = ExpenseApprovalSerializer(escalation)
        return api_response(data=serializer.data, message="Expense escalated successfully")
        
    except Expense.DoesNotExist:
        return api_response(
            message='Expense not found',
            status_code=404
        )
    except User.DoesNotExist:
        return api_response(
            message='Escalation target not found',
            status_code=400
        )
    except Exception as e:
        return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_approval_dashboard(request):
    """Get approval dashboard data for the user"""
    try:
        user = request.user
        
        # Get pending approvals
        pending_approvals = ExpenseApprovalService.get_pending_approvals_for_user(user)
        
        # Get approval statistics
        stats = ExpenseApprovalService.get_approval_statistics(user.company)
        
        # Get recent approvals
        recent_approvals = ExpenseApproval.objects.filter(
            approver=user,
            decision__in=['Approved', 'Rejected']
        ).order_by('-decided_at')[:10]
        
        # Get team expenses if manager
        team_expenses = []
        if user.role in ['Admin', 'Manager']:
            from apps.users.services import get_user_team_expenses
            team_expenses = get_user_team_expenses(user)[:10]
        
        return api_response(data={
            'pending_approvals': ExpenseApprovalSerializer(pending_approvals, many=True).data,
            'statistics': stats,
            'recent_approvals': ExpenseApprovalSerializer(recent_approvals, many=True).data,
            'team_expenses': team_expenses
        }, message="Dashboard data retrieved successfully")
    except Exception as e:
        return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder_workflow_approvers(request, workflow_id):
    """Reorder approvers in a workflow"""
    try:
        workflow = ApprovalWorkflow.objects.get(
            id=workflow_id,
            company=request.user.company
        )
        
        approver_orders = request.data.get('approver_orders', [])
        
        if not approver_orders:
            return api_response(
                message='approver_orders is required',
                status_code=400
            )
        
        with transaction.atomic():
            ApprovalWorkflowService.reorder_approvers(workflow, approver_orders)
            
            # Return updated workflow
            serializer = ApprovalWorkflowSerializer(workflow)
            return api_response(data=serializer.data, message="Workflow approvers reordered successfully")
            
    except ApprovalWorkflow.DoesNotExist:
        return api_response(
            message='Workflow not found',
            status_code=404
        )
    except Exception as e:
        return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_workflow_analytics(request, workflow_id):
    """Get analytics for a specific workflow"""
    try:
        workflow = ApprovalWorkflow.objects.get(
            id=workflow_id,
            company=request.user.company
        )
        
        # Get workflow statistics
        stats = ApprovalWorkflowService.get_workflow_statistics(workflow)
        
        # Get approval rate
        total_expenses = Expense.objects.filter(company=workflow.company).count()
        approved_expenses = Expense.objects.filter(
            company=workflow.company,
            status='Approved'
        ).count()
        
        approval_rate = (approved_expenses / total_expenses * 100) if total_expenses > 0 else 0
        
        # Get average approval time
        completed_approvals = ExpenseApproval.objects.filter(
            expense__company=workflow.company,
            decision__in=['Approved', 'Rejected'],
            decided_at__isnull=False
        )
        
        avg_approval_time = 0
        if completed_approvals.exists():
            total_time = sum([
                (approval.decided_at - approval.created_at).total_seconds()
                for approval in completed_approvals
            ])
            avg_approval_time = total_time / completed_approvals.count()
        
        return api_response(data={
            'workflow': ApprovalWorkflowSerializer(workflow).data,
            'statistics': stats,
            'approval_rate': round(approval_rate, 2),
            'average_approval_time_hours': round(avg_approval_time / 3600, 2)
        }, message="Workflow analytics retrieved successfully")
        
    except ApprovalWorkflow.DoesNotExist:
        return api_response(
            message='Workflow not found',
            status_code=404
        )
    except Exception as e:
        return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
