"""Expense service layer.

Centralizes database operations and business rules for expenses:
- Expense CRUD, listing with role-based filtering, approval tracking.
"""

from typing import Optional, Dict, Any
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage
from decimal import Decimal

from apps.companies.models import Company
from apps.approvals.models import ExpenseApproval
from .models import Expense

User = get_user_model()


def convert_currency(amount: Decimal, from_currency: str, company: Company) -> Decimal:
    """
    Convert amount from original currency to company's default currency.
    For now, this is a placeholder - implement actual currency conversion logic.
    """
    # TODO: Implement actual currency conversion using exchange rates API
    # For now, just return the original amount if currencies match
    if from_currency == company.default_currency:
        return amount
    
    # Placeholder conversion (you should implement actual conversion)
    # Example: Use an exchange rate API or database
    return amount  # Return as-is for now


@transaction.atomic
def create_expense(
    *,
    employee: User,
    company: Company,
    amount: Decimal,
    original_currency: str,
    category: str,
    description: str,
    expense_date,
    receipt_image=None
) -> Expense:
    """
    Create a new expense request.
    Sets current_approver to employee's manager if is_manager_approver is True.
    """
    # Convert currency if needed
    converted_amount = convert_currency(amount, original_currency, company)
    
    # Determine current approver (if employee has manager and is_manager_approver is True)
    current_approver = None
    current_step = 0
    
    if employee.manager and employee.is_manager_approver:
        current_approver = employee.manager
        current_step = 0  # Manager approval step
    
    # Create expense
    expense = Expense.objects.create(
        employee=employee,
        company=company,
        amount=amount,
        original_currency=original_currency,
        converted_amount=converted_amount,
        category=category,
        description=description,
        expense_date=expense_date,
        status='Pending',
        current_approver=current_approver,
        current_step=current_step,
        receipt_image=receipt_image,
    )
    
    # Create initial approval record for manager (if applicable)
    if current_approver:
        ExpenseApproval.objects.create(
            expense=expense,
            approver=current_approver,
            step_number=0,
            decision='Pending',
        )
    
    return expense


@transaction.atomic
def update_expense(expense: Expense, **fields) -> Expense:
    """
    Update an expense request.
    Only allowed if status is 'Pending'.
    """
    if expense.status != 'Pending':
        raise ValueError("Cannot update expense that is not in Pending status.")
    
    # Update converted amount if amount or currency changed
    if 'amount' in fields or 'original_currency' in fields:
        amount = fields.get('amount', expense.amount)
        currency = fields.get('original_currency', expense.original_currency)
        fields['converted_amount'] = convert_currency(amount, currency, expense.company)
    
    for k, v in fields.items():
        setattr(expense, k, v)
    
    expense.save()
    return expense


@transaction.atomic
def delete_expense(expense: Expense) -> None:
    """Soft delete an expense (only if status is Pending)."""
    if expense.status != 'Pending':
        raise ValueError("Cannot delete expense that is not in Pending status.")
    expense.delete()


def build_expense_list_payload(expense: Expense) -> dict:
    """Lightweight expense payload for list views."""
    current_approver_name = None
    if expense.current_approver:
        current_approver_name = expense.current_approver.name
    
    return {
        "id": str(expense.id),
        "employee_name": expense.employee.name,
        "employee_email": expense.employee.email,
        "employee_id": expense.employee.employee_id,
        "amount": expense.amount,
        "original_currency": expense.original_currency,
        "category": expense.category,
        "expense_date": expense.expense_date,
        "status": expense.status,
        "current_approver_name": current_approver_name,
        "current_step": expense.current_step,
        "created_at": expense.created_at,
    }


def build_expense_detail_payload(expense: Expense) -> dict:
    """Detailed expense payload with full tracking information."""
    employee_info = {
        "id": str(expense.employee.id),
        "name": expense.employee.name,
        "email": expense.employee.email,
        "employee_id": expense.employee.employee_id,
        "department": expense.employee.department,
    }
    
    company_info = {
        "id": str(expense.company.id),
        "name": expense.company.name,
        "default_currency": expense.company.default_currency,
    }
    
    current_approver_info = None
    if expense.current_approver:
        current_approver_info = {
            "id": str(expense.current_approver.id),
            "name": expense.current_approver.name,
            "email": expense.current_approver.email,
            "employee_id": expense.current_approver.employee_id,
        }
    
    # Get approval history
    approval_history = []
    approvals = expense.approval_logs.select_related('approver').order_by('step_number', 'created_at')
    for approval in approvals:
        approval_history.append({
            "step_number": approval.step_number,
            "approver_name": approval.approver.name,
            "approver_email": approval.approver.email,
            "decision": approval.decision,
            "comments": approval.comments,
            "decided_at": approval.decided_at,
            "created_at": approval.created_at,
        })
    
    return {
        "id": str(expense.id),
        "employee": employee_info,
        "company": company_info,
        "amount": expense.amount,
        "original_currency": expense.original_currency,
        "converted_amount": expense.converted_amount,
        "category": expense.category,
        "description": expense.description,
        "expense_date": expense.expense_date,
        "status": expense.status,
        "current_approver": current_approver_info,
        "current_step": expense.current_step,
        "receipt_image": expense.receipt_image.url if expense.receipt_image else None,
        "ocr_extracted_text": expense.ocr_extracted_text,
        "ocr_merchant_name": expense.ocr_merchant_name,
        "ocr_extracted_amount": expense.ocr_extracted_amount,
        "ocr_extracted_date": expense.ocr_extracted_date,
        "approval_history": approval_history,
        "created_at": expense.created_at,
        "updated_at": expense.updated_at,
    }


def list_expenses(
    *,
    user: User,
    page: int = 1,
    page_size: int = 10,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    employee_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    List expenses with role-based filtering, pagination, and search.
    
    Role-based logic:
    - Admin: See all expenses in the company
    - Manager: See expenses from subordinates (users who have this manager assigned)
    - Employee: See only their own expenses
    """
    company = user.company
    
    # Start with base queryset
    queryset = Expense.objects.filter(company=company).select_related(
        'employee', 'company', 'current_approver'
    )
    
    # Apply role-based filtering
    if user.role == 'Admin':
        # Admin sees all expenses in the company
        pass
    elif user.role == 'Manager':
        # Manager sees expenses from their subordinates
        subordinate_ids = User.objects.filter(manager=user).values_list('id', flat=True)
        queryset = queryset.filter(employee_id__in=subordinate_ids)
    else:  # Employee
        # Employee sees only their own expenses
        queryset = queryset.filter(employee=user)
    
    # Apply filters
    if status:
        queryset = queryset.filter(status=status)
    
    if category:
        queryset = queryset.filter(category=category)
    
    if employee_id:
        queryset = queryset.filter(employee__employee_id__icontains=employee_id)
    
    if date_from:
        queryset = queryset.filter(expense_date__gte=date_from)
    
    if date_to:
        queryset = queryset.filter(expense_date__lte=date_to)
    
    # Apply search across multiple fields
    if search:
        queryset = queryset.filter(
            Q(employee__name__icontains=search) |
            Q(employee__email__icontains=search) |
            Q(employee__employee_id__icontains=search) |
            Q(description__icontains=search) |
            Q(category__icontains=search)
        )
    
    # Order by most recent first
    queryset = queryset.order_by('-created_at')
    
    # Get total count before pagination
    total_count = queryset.count()
    
    # Apply pagination
    paginator = Paginator(queryset, page_size)
    
    try:
        expenses_page = paginator.page(page)
    except EmptyPage:
        # If page is out of range, return empty results
        expenses_page = paginator.page(paginator.num_pages) if paginator.num_pages > 0 else []
    
    # Build lightweight payloads for list view
    expenses_data = [build_expense_list_payload(expense) for expense in expenses_page] if expenses_page else []
    
    return {
        "expenses": expenses_data,
        "pagination": {
            "current_page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": paginator.num_pages,
            "has_next": expenses_page.has_next() if expenses_page else False,
            "has_previous": expenses_page.has_previous() if expenses_page else False,
        },
        "filters": {
            "status": status,
            "category": category,
            "search": search,
            "date_from": date_from,
            "date_to": date_to,
            "employee_id": employee_id,
        }
    }


def get_expense_by_id(expense_id: str, user: User) -> Optional[Expense]:
    """
    Get expense by ID with role-based access control.
    
    Access rules:
    - Admin: Can access all expenses in their company
    - Manager: Can access expenses from their subordinates
    - Employee: Can only access their own expenses
    """
    try:
        expense = Expense.objects.select_related(
            'employee', 'company', 'current_approver'
        ).prefetch_related('approval_logs__approver').get(id=expense_id)
        
        # Check access permissions
        if user.role == 'Admin':
            # Admin can access all expenses in their company
            if expense.company != user.company:
                return None
        elif user.role == 'Manager':
            # Manager can access expenses from subordinates
            subordinate_ids = User.objects.filter(manager=user).values_list('id', flat=True)
            if expense.employee_id not in subordinate_ids:
                return None
        else:  # Employee
            # Employee can only access their own expenses
            if expense.employee != user:
                return None
        
        return expense
    except Expense.DoesNotExist:
        return None
