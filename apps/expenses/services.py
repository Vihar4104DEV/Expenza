from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from apps.expenses.models import Expense
from apps.approvals.models import ApprovalWorkflow, WorkflowApprover, ExpenseApproval
from apps.users.models import User
import requests


class CurrencyService:
    """Service for currency conversion"""
    
    @staticmethod
    def convert_currency(amount, from_currency, to_currency):
        """Convert currency using external API"""
        try:
            url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
            response = requests.get(url)
            response.raise_for_status()
            
            rates = response.json()['rates']
            if to_currency in rates:
                converted_amount = Decimal(str(amount)) * Decimal(str(rates[to_currency]))
                return round(converted_amount, 2)
            else:
                return None
        except Exception as e:
            print(f"Currency conversion error: {e}")
            return None
    
    @staticmethod
    def get_currency_list():
        """Get list of supported currencies"""
        try:
            url = "https://restcountries.com/v3.1/all?fields=name,currencies"
            response = requests.get(url)
            response.raise_for_status()
            
            currencies = set()
            for country in response.json():
                if 'currencies' in country:
                    for currency_code in country['currencies'].keys():
                        currencies.add(currency_code)
            
            return sorted(list(currencies))
        except Exception as e:
            print(f"Currency list error: {e}")
            return ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']


class ExpenseService:
    """Service class for Expense-related business logic"""
    
    @staticmethod
    def create_expense(expense_data):
        """Create a new expense and set up approval workflow"""
        with transaction.atomic():
            expense = Expense.objects.create(**expense_data)
            
            # Convert currency if needed
            if expense.original_currency != expense.company.default_currency:
                converted_amount = CurrencyService.convert_currency(
                    expense.amount,
                    expense.original_currency,
                    expense.company.default_currency
                )
                if converted_amount:
                    expense.converted_amount = converted_amount
                    expense.save()
            
            # Set up approval workflow
            ExpenseService._setup_approval_workflow(expense)
            
            return expense
    
    @staticmethod
    def _setup_approval_workflow(expense):
        """Set up approval workflow for an expense"""
        employee = expense.employee
        
        # Check if manager should approve first
        if employee.is_manager_approver and employee.manager:
            expense.current_approver = employee.manager
            expense.current_step = 0
            expense.status = 'In-Progress'
            expense.save()
            
            # Create approval record
            ExpenseApproval.objects.create(
                expense=expense,
                approver=employee.manager,
                step_number=0,
                decision='Pending'
            )
        else:
            # Get default workflow for company
            workflow = ApprovalWorkflow.objects.filter(
                company=expense.company,
                is_default=True
            ).first()
            
            if workflow:
                ExpenseService._apply_workflow(expense, workflow)
            else:
                # No workflow, auto-approve
                expense.status = 'Approved'
                expense.save()
    
    @staticmethod
    def _apply_workflow(expense, workflow):
        """Apply a workflow to an expense"""
        if workflow.rule_type == 'Sequential':
            ExpenseService._apply_sequential_workflow(expense, workflow)
        elif workflow.rule_type == 'Percentage':
            ExpenseService._apply_percentage_workflow(expense, workflow)
        elif workflow.rule_type == 'SpecificApprover':
            ExpenseService._apply_specific_approver_workflow(expense, workflow)
        elif workflow.rule_type == 'Hybrid':
            ExpenseService._apply_hybrid_workflow(expense, workflow)
    
    @staticmethod
    def _apply_sequential_workflow(expense, workflow):
        """Apply sequential workflow"""
        approvers = WorkflowApprover.objects.filter(workflow=workflow).order_by('sequence')
        if approvers.exists():
            first_approver = approvers.first()
            expense.current_approver = first_approver.approver
            expense.current_step = first_approver.sequence
            expense.status = 'In-Progress'
            expense.save()
            
            # Create approval record
            ExpenseApproval.objects.create(
                expense=expense,
                approver=first_approver.approver,
                step_number=first_approver.sequence,
                decision='Pending'
            )
    
    @staticmethod
    def _apply_percentage_workflow(expense, workflow):
        """Apply percentage workflow"""
        approvers = WorkflowApprover.objects.filter(workflow=workflow)
        if approvers.exists():
            expense.status = 'In-Progress'
            expense.save()
            
            # Create approval records for all approvers
            for approver in approvers:
                ExpenseApproval.objects.create(
                    expense=expense,
                    approver=approver.approver,
                    step_number=approver.sequence,
                    decision='Pending'
                )
    
    @staticmethod
    def _apply_specific_approver_workflow(expense, workflow):
        """Apply specific approver workflow"""
        if workflow.specific_approver:
            expense.current_approver = workflow.specific_approver
            expense.current_step = 1
            expense.status = 'In-Progress'
            expense.save()
            
            # Create approval record
            ExpenseApproval.objects.create(
                expense=expense,
                approver=workflow.specific_approver,
                step_number=1,
                decision='Pending'
            )
    
    @staticmethod
    def _apply_hybrid_workflow(expense, workflow):
        """Apply hybrid workflow"""
        # For hybrid, we'll use sequential as primary with conditional shortcuts
        ExpenseService._apply_sequential_workflow(expense, workflow)
    
    @staticmethod
    def process_approval(expense, approver, decision, comments=''):
        """Process an approval decision"""
        with transaction.atomic():
            # Update approval record
            approval = ExpenseApproval.objects.filter(
                expense=expense,
                approver=approver,
                decision='Pending'
            ).first()
            print("got expense")
            if not approval:
                raise ValueError("No pending approval found for this approver")
            
            approval.decision = decision
            approval.comments = comments
            approval.decided_at = timezone.now()
            approval.save()
            print("saved the approval partial")
            
            if decision == 'Rejected':
                expense.status = 'Rejected'
                expense.current_approver = None
                expense.save()
            else:
                # Check if this was a specific approver approval
                if expense.current_approver == approver and approver == approval.approver:
                    # Check if this was a specific approver workflow
                    workflow = ApprovalWorkflow.objects.filter(
                        company=expense.company,
                        specific_approver=approver
                    ).first()
                    
                    if workflow and workflow.rule_type == 'SpecificApprover':
                        expense.status = 'Approved'
                        expense.current_approver = None
                        expense.save()
                    else:
                        # Move to next approver
                        ExpenseService._move_to_next_approver(expense)
                else:
                    # Check percentage workflow
                    ExpenseService._check_percentage_approval(expense)
    
    @staticmethod
    def _move_to_next_approver(expense):
        """Move expense to next approver in sequence"""
        workflow = ApprovalWorkflow.objects.filter(
            company=expense.company,
            is_default=True
        ).first()
        
        if not workflow:
            expense.status = 'Approved'
            expense.current_approver = None
            expense.save()
            return
        
        next_approver = WorkflowApprover.objects.filter(
            workflow=workflow,
            sequence__gt=expense.current_step
        ).order_by('sequence').first()
        
        if next_approver:
            expense.current_approver = next_approver.approver
            expense.current_step = next_approver.sequence
            expense.save()
            
            # Create approval record
            ExpenseApproval.objects.create(
                expense=expense,
                approver=next_approver.approver,
                step_number=next_approver.sequence,
                decision='Pending'
            )
        else:
            expense.status = 'Approved'
            expense.current_approver = None
            expense.save()
    
    @staticmethod
    def _check_percentage_approval(expense):
        """Check if percentage approval threshold is met"""
        workflow = ApprovalWorkflow.objects.filter(
            company=expense.company,
            is_default=True
        ).first()
        
        if not workflow or workflow.rule_type != 'Percentage':
            return
        
        total_approvers = WorkflowApprover.objects.filter(workflow=workflow).count()
        approved_count = ExpenseApproval.objects.filter(
            expense=expense,
            decision='Approved'
        ).count()
        
        threshold = workflow.percentage_threshold or 50
        required_approvals = (total_approvers * threshold) // 100
        
        if approved_count >= required_approvals:
            expense.status = 'Approved'
            expense.current_approver = None
            expense.save()
    
    @staticmethod
    def escalate_expense(expense, escalated_to):
        """Escalate an expense to a higher authority"""
        with transaction.atomic():
            expense.current_approver = escalated_to
            expense.status = 'In-Progress'
            expense.save()
            
            # Create escalation record
            ExpenseApproval.objects.create(
                expense=expense,
                approver=escalated_to,
                step_number=expense.current_step + 1,
                decision='Pending'
            )
    
    @staticmethod
    def get_expense_approval_history(expense):
        """Get approval history for an expense"""
        return ExpenseApproval.objects.filter(expense=expense).order_by('step_number', 'created_at')
    
    @staticmethod
    def get_expenses_by_status(company, status):
        """Get expenses by status for a company"""
        return Expense.objects.filter(company=company, status=status)
    
    @staticmethod
    def get_user_expenses(user, status=None):
        """Get expenses for a user, optionally filtered by status"""
        queryset = Expense.objects.filter(employee=user)
        if status:
            queryset = queryset.filter(status=status)
        return queryset
