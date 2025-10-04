from django.contrib import admin

from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "default_currency", "is_active", "created_at")
    search_fields = ("name", "country", "default_currency")
    list_filter = ("country", "default_currency", "is_active")
