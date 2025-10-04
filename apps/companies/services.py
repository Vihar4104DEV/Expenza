from django.db import transaction
from apps.companies.models import Company
from apps.users.models import User


class CompanyService:
    """Service class for Company-related business logic"""
    
    @staticmethod
    def create_company_with_admin(company_data, admin_data):
        """Create a company and its first admin user"""
        with transaction.atomic():
            # Create company
            company = Company.objects.create(**company_data)
            
            # Create admin user
            admin_data['company'] = company
            admin_data['role'] = 'Admin'
            admin = User.objects.create_user(**admin_data)
            
            return company, admin
    
    @staticmethod
    def get_company_users(company_id, role=None):
        """Get all users for a company, optionally filtered by role"""
        from apps.users.models import User
        queryset = User.objects.filter(company_id=company_id, is_active=True)
        if role:
            queryset = queryset.filter(role=role)
        return queryset
    
    @staticmethod
    def get_company_statistics(company_id):
        """Get statistics for a company"""
        from apps.expenses.models import Expense
        from apps.approvals.models import ApprovalWorkflow
        
        total_users = User.objects.filter(company_id=company_id, is_active=True).count()
        total_expenses = Expense.objects.filter(company_id=company_id).count()
        total_workflows = ApprovalWorkflow.objects.filter(company_id=company_id).count()
        
        return {
            'total_users': total_users,
            'total_expenses': total_expenses,
            'total_workflows': total_workflows
        }
