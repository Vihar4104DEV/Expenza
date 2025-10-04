from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel


class ApprovalWorkflow(BaseModel):
    """Approval flow definition for a company with optional conditional rules.

    Denotes:
    - A reusable workflow (sequential/conditional) applied to expenses.

    Why:
    - Supports sequential steps and conditional shortcuts (percentage/specific approver).
    - `is_default` lets a company pick a default workflow.
    """

    RULE_TYPE_CHOICES = [
        ("Sequential", "Sequential Multi-Level"),
        ("Percentage", "Percentage Rule"),
        ("SpecificApprover", "Specific Approver Rule"),
        ("Hybrid", "Hybrid (Sequential + Conditional)"),
    ]

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='approval_workflows',
    )
    name = models.CharField(max_length=255)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPE_CHOICES, default='Sequential')

    percentage_threshold = models.IntegerField(
        null=True,
        blank=True,
        help_text="e.g., 60 means 60% of approvers must approve",
    )
    specific_approver = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='special_approval_workflows',
        help_text="e.g., CFO - if this person approves, auto-approve",
    )

    is_default = models.BooleanField(
        default=False,
        help_text="Default workflow for this company",
    )

    class Meta:
        db_table = 'approval_workflows'

    def __str__(self) -> str:
        return f"{self.company.name} - {self.name}"


class WorkflowApprover(BaseModel):
    """Approver assignment in a workflow with sequence order.

    Denotes:
    - A single step in a workflow tied to a specific approver and label.

    Why:
    - `sequence` maintains deterministic ordering for sequential approvals.
    - Constraint `unique_together` keeps one record per workflow+sequence.
    """

    workflow = models.ForeignKey(
        ApprovalWorkflow,
        on_delete=models.CASCADE,
        related_name='approvers',
    )
    approver = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='workflow_assignments',
        limit_choices_to={'role__in': ['Manager', 'Admin']},
    )
    sequence = models.IntegerField(help_text="1 = Finance, 2 = Director, etc.")
    approver_title = models.CharField(
        max_length=100,
        blank=True,
        help_text="e.g., Finance, Director, CFO",
    )

    class Meta:
        db_table = 'workflow_approvers'
        ordering = ['sequence']
        unique_together = ['workflow', 'sequence']

    def __str__(self) -> str:
        return f"{self.workflow.name} - Step {self.sequence}: {self.approver.name}"


class ExpenseApproval(BaseModel):
    """Approval/rejection decisions for an expense by a specific approver.

    Denotes:
    - One decision at a particular step of the process.

    Why:
    - History of decisions for auditability.
    - `decided_at` auto-filled when a decision is made.
    """

    DECISION_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    expense = models.ForeignKey(
        'expenses.Expense',
        on_delete=models.CASCADE,
        related_name='approval_logs',
    )
    approver = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='approval_actions',
    )
    step_number = models.IntegerField(
        help_text="0 = Manager, 1+ = Workflow steps",
    )
    decision = models.CharField(
        max_length=20,
        choices=DECISION_CHOICES,
        default='Pending',
    )
    comments = models.TextField(blank=True, null=True)
    decided_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'expense_approvals'
        ordering = ['step_number', 'created_at']

    def __str__(self) -> str:
        return f"Expense #{self.expense.id} - Step {self.step_number} - {self.decision}"

    def save(self, *args, **kwargs):
        if self.decision in ['Approved', 'Rejected'] and not self.decided_at:
            self.decided_at = timezone.now()
        return super().save(*args, **kwargs)
