from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "company", "role", "is_manager_approver", "is_active", "created_at")
    search_fields = ("name", "email", "employee_id")
    list_filter = ("role", "company", "is_active")
