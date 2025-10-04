from django.contrib import admin

from .models import ApprovalWorkflow, WorkflowApprover, ExpenseApproval


@admin.register(ApprovalWorkflow)
class ApprovalWorkflowAdmin(admin.ModelAdmin):
    list_display = ("company", "name", "rule_type", "is_default", "created_at")
    search_fields = ("name",)
    list_filter = ("company", "rule_type", "is_default")


@admin.register(WorkflowApprover)
class WorkflowApproverAdmin(admin.ModelAdmin):
    list_display = ("workflow", "sequence", "approver", "approver_title")
    list_filter = ("workflow",)


@admin.register(ExpenseApproval)
class ExpenseApprovalAdmin(admin.ModelAdmin):
    list_display = ("expense", "approver", "step_number", "decision", "decided_at")
    list_filter = ("decision", "step_number")
    search_fields = ("expense__id", "approver__name", "approver__email")
