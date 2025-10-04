from django.db import transaction
from django.core.exceptions import ValidationError
from apps.approvals.models import ApprovalWorkflow, WorkflowApprover, ExpenseApproval
from apps.expenses.models import Expense
from apps.users.models import User


class ApprovalWorkflowService:
    """Service class for ApprovalWorkflow-related business logic"""
    
    @staticmethod
    def create_workflow(workflow_data, approvers_data=None):
        """Create a new approval workflow with approvers"""
        with transaction.atomic():
            workflow = ApprovalWorkflow.objects.create(**workflow_data)
            
            if approvers_data:
                for approver_data in approvers_data:
                    approver_data['workflow'] = workflow
                    WorkflowApprover.objects.create(**approver_data)
            
            return workflow
    
    @staticmethod
    def update_workflow_approvers(workflow, approvers_data):
        """Update workflow approvers"""
        with transaction.atomic():
            # Clear existing approvers
            WorkflowApprover.objects.filter(workflow=workflow).delete()
            
            # Create new approvers
            for approver_data in approvers_data:
                approver_data['workflow'] = workflow
                WorkflowApprover.objects.create(**approver_data)
    
    @staticmethod
    def reorder_approvers(workflow, approver_orders):
        """Reorder workflow approvers"""
        with transaction.atomic():
            for order_data in approver_orders:
                approver_id = order_data.get('approver_id')
                new_sequence = order_data.get('sequence')
                
                approver = WorkflowApprover.objects.filter(
                    id=approver_id,
                    workflow=workflow
                ).first()
                
                if approver:
                    approver.sequence = new_sequence
                    approver.save()
    
    @staticmethod
    def set_default_workflow(company, workflow):
        """Set a workflow as default for a company"""
        with transaction.atomic():
            # Remove default from other workflows
            ApprovalWorkflow.objects.filter(
                company=company,
                is_default=True
            ).update(is_default=False)
            
            # Set new default
            workflow.is_default = True
            workflow.save()
    
    @staticmethod
    def validate_workflow(workflow_data):
        """Validate workflow configuration"""
        rule_type = workflow_data.get('rule_type')
        
        if rule_type == 'Percentage':
            if not workflow_data.get('percentage_threshold'):
                raise ValidationError("Percentage threshold is required for Percentage rule type")
            
            threshold = workflow_data['percentage_threshold']
            if not (1 <= threshold <= 100):
                raise ValidationError("Percentage threshold must be between 1 and 100")
        
        elif rule_type == 'SpecificApprover':
            if not workflow_data.get('specific_approver'):
                raise ValidationError("Specific approver is required for SpecificApprover rule type")
        
        elif rule_type == 'Hybrid':
            if not (workflow_data.get('percentage_threshold') or workflow_data.get('specific_approver')):
                raise ValidationError("Hybrid rule requires either percentage threshold or specific approver")
    
    @staticmethod
    def get_workflow_for_expense(expense):
        """Get the appropriate workflow for an expense"""
        # Check if there's a specific workflow for this expense type/amount
        # For now, return the default workflow
        return ApprovalWorkflow.objects.filter(
            company=expense.company,
            is_default=True
        ).first()
    
    @staticmethod
    def get_workflow_statistics(workflow):
        """Get statistics for a workflow"""
        total_expenses = Expense.objects.filter(company=workflow.company).count()
        workflow_expenses = Expense.objects.filter(
            company=workflow.company,
            status__in=['In-Progress', 'Approved', 'Rejected']
        ).count()
        
        return {
            'total_expenses': total_expenses,
            'workflow_expenses': workflow_expenses,
            'approvers_count': WorkflowApprover.objects.filter(workflow=workflow).count()
        }


class ExpenseApprovalService:
    """Service class for ExpenseApproval-related business logic"""
    
    @staticmethod
    def create_approval_record(expense, approver, step_number):
        """Create a new approval record"""
        return ExpenseApproval.objects.create(
            expense=expense,
            approver=approver,
            step_number=step_number,
            decision='Pending'
        )
    
    @staticmethod
    def process_approval_decision(approval_id, decision, comments=''):
        """Process an approval decision"""
        with transaction.atomic():
            approval = ExpenseApproval.objects.get(id=approval_id)
            approval.decision = decision
            approval.comments = comments
            approval.save()
            
            # Update expense status based on decision
            if decision == 'Rejected':
                approval.expense.status = 'Rejected'
                approval.expense.current_approver = None
                approval.expense.save()
            elif decision == 'Approved':
                # Check if this completes the approval process
                from apps.expenses.services import ExpenseService
                ExpenseService._check_percentage_approval(approval.expense)
                ExpenseService._move_to_next_approver(approval.expense)
    
    @staticmethod
    def get_pending_approvals_for_user(user):
        """Get all pending approvals for a user"""
        return ExpenseApproval.objects.filter(
            approver=user,
            decision='Pending'
        ).select_related('expense', 'expense__employee')
    
    @staticmethod
    def get_approval_history_for_expense(expense):
        """Get approval history for an expense"""
        return ExpenseApproval.objects.filter(
            expense=expense
        ).order_by('step_number', 'created_at')
    
    @staticmethod
    def get_approval_statistics(company):
        """Get approval statistics for a company"""
        total_approvals = ExpenseApproval.objects.filter(
            expense__company=company
        ).count()
        
        approved_count = ExpenseApproval.objects.filter(
            expense__company=company,
            decision='Approved'
        ).count()
        
        rejected_count = ExpenseApproval.objects.filter(
            expense__company=company,
            decision='Rejected'
        ).count()
        
        pending_count = ExpenseApproval.objects.filter(
            expense__company=company,
            decision='Pending'
        ).count()
        
        return {
            'total_approvals': total_approvals,
            'approved_count': approved_count,
            'rejected_count': rejected_count,
            'pending_count': pending_count,
            'approval_rate': (approved_count / total_approvals * 100) if total_approvals > 0 else 0
        }
    
    @staticmethod
    def escalate_approval(expense, escalated_to, reason=''):
        """Escalate an approval to a higher authority"""
        with transaction.atomic():
            # Create escalation record
            escalation = ExpenseApproval.objects.create(
                expense=expense,
                approver=escalated_to,
                step_number=expense.current_step + 1,
                decision='Pending',
                comments=f"Escalated: {reason}"
            )
            
            # Update expense
            expense.current_approver = escalated_to
            expense.current_step += 1
            expense.status = 'In-Progress'
            expense.save()
            
            return escalation
