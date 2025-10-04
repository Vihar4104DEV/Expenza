from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import transaction

from apps.approvals.models import ApprovalWorkflow, WorkflowApprover, ExpenseApproval
from apps.expenses.models import Expense
from apps.users.models import User
from apps.approvals.serializers import (
    ApprovalWorkflowSerializer, WorkflowApproverSerializer,
    ExpenseApprovalSerializer, ApprovalDecisionSerializer
)
from apps.approvals.services import ApprovalWorkflowService, ExpenseApprovalService


@api_view(['POST'])
@permission_classes([AllowAny])
def create_workflow_with_approvers(request):
    """Create a workflow with multiple approvers in one request"""
    if request.user.role != 'Admin':
        return Response(
            {'error': 'Only Admin can create workflows'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    workflow_data = request.data.get('workflow', {})
    approvers_data = request.data.get('approvers', [])
    
    try:
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
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def bulk_approve_expenses(request):
    """Bulk approve multiple expenses"""
    if request.user.role not in ['Admin', 'Manager']:
        return Response(
            {'error': 'Only Admin and Manager can approve expenses'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    expense_ids = request.data.get('expense_ids', [])
    decision = request.data.get('decision', 'Approved')
    comments = request.data.get('comments', '')
    
    if not expense_ids:
        return Response(
            {'error': 'expense_ids is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if decision not in ['Approved', 'Rejected']:
        return Response(
            {'error': 'Decision must be either "Approved" or "Rejected"'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
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
            
            return Response({
                'approved_expenses': approved_expenses,
                'failed_expenses': failed_expenses,
                'message': f'Processed {len(expense_ids)} expenses'
            })
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
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
            return Response(
                {'error': 'escalated_to is required'},
                status=status.HTTP_400_BAD_REQUEST
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
        return Response(serializer.data)
        
    except Expense.DoesNotExist:
        return Response(
            {'error': 'Expense not found'},
            status=status.HTTP_404_NOT_FOUND
        )
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


@api_view(['GET'])
@permission_classes([AllowAny])
def get_approval_dashboard(request):
    """Get approval dashboard data for the user"""
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
        from apps.users.services import UserService
        team_expenses = UserService.get_user_team_expenses(user)[:10]
    
    return Response({
        'pending_approvals': ExpenseApprovalSerializer(pending_approvals, many=True).data,
        'statistics': stats,
        'recent_approvals': ExpenseApprovalSerializer(recent_approvals, many=True).data,
        'team_expenses': team_expenses
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def reorder_workflow_approvers(request, workflow_id):
    """Reorder approvers in a workflow"""
    try:
        workflow = ApprovalWorkflow.objects.get(
            id=workflow_id,
            company=request.user.company
        )
        
        approver_orders = request.data.get('approver_orders', [])
        
        if not approver_orders:
            return Response(
                {'error': 'approver_orders is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            ApprovalWorkflowService.reorder_approvers(workflow, approver_orders)
            
            # Return updated workflow
            serializer = ApprovalWorkflowSerializer(workflow)
            return Response(serializer.data)
            
    except ApprovalWorkflow.DoesNotExist:
        return Response(
            {'error': 'Workflow not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
        

@api_view(['GET'])
@permission_classes([AllowAny])
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
        
        return Response({
            'workflow': ApprovalWorkflowSerializer(workflow).data,
            'statistics': stats,
            'approval_rate': round(approval_rate, 2),
            'average_approval_time_hours': round(avg_approval_time / 3600, 2)
        })
        
    except ApprovalWorkflow.DoesNotExist:
        return Response(
            {'error': 'Workflow not found'},
            status=status.HTTP_404_NOT_FOUND
        )
