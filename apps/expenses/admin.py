from django.contrib import admin

from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("employee", "company", "amount", "original_currency", "status", "current_step", "created_at")
    search_fields = ("employee__name", "employee__email", "description")
    list_filter = ("status", "category", "company")
