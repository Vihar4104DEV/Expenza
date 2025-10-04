"""Users service layer.

Centralizes database operations and business rules for users:
- Admin/company bootstrap, user CRUD, activation, and password flows.
"""

from typing import Optional, Tuple, Iterable, Dict, Any
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.validators import validate_email_address, validate_password_strength
from apps.companies.models import Company
from .models import User


@transaction.atomic
def create_company_and_admin(*, name: str, country: str, default_currency: str, admin_name: str, admin_email: str, password: str, employee_id: str) -> Tuple[Company, User]:
    """Create a company and an Admin user in a single transaction.

    The admin is created with `role='Admin'` and `is_email_verified=False` initially;
    calling code should handle OTP verification before enabling full access.
    """
    validate_password_strength(password)
    admin_email = validate_email_address(admin_email)

    company = Company.objects.create(name=name, country=country, default_currency=default_currency)
    user = User.objects.create(
        company=company,
        name=admin_name,
        email=admin_email,
        employee_id=employee_id,
        role='Admin',
        password=make_password(password),
        is_manager_approver=False,
    )
    return company, user


def build_user_payload(user: User) -> dict:
    """Standardize user payload for API responses across login and signup."""
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "employee_id": user.employee_id,
        "role": user.role,
        "company": {
            "id": str(user.company.id),
            "name": user.company.name,
            "country": user.company.country,
            "default_currency": user.company.default_currency,
        },
        "is_active": user.is_active,
        "is_email_verified": getattr(user, 'is_email_verified', False),
    }


def build_user_list_payload(user: User) -> dict:
    """Lightweight user payload for list views - returns only essential fields."""
    manager_info = None
    if user.manager:
        manager_info = {
            "id": str(user.manager.id),
            "name": user.manager.name,
            "email": user.manager.email,
        }
    
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "employee_id": user.employee_id,
        "role": user.role,
        "department": user.department,
        "is_active": user.is_active,
        "manager": manager_info,
    }


def get_user_detail_payload(user: User) -> dict:
    """Detailed user payload for individual user view."""
    manager_info = None
    if user.manager:
        manager_info = {
            "id": str(user.manager.id),
            "name": user.manager.name,
            "email": user.manager.email,
            "employee_id": user.manager.employee_id,
        }
    
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "employee_id": user.employee_id,
        "mobile_no": user.mobile_no,
        "role": user.role,
        "department": user.department,
        "is_active": user.is_active,
        "is_email_verified": user.is_email_verified,
        "is_manager_approver": user.is_manager_approver,
        "manager": manager_info,
        "company": {
            "id": str(user.company.id),
            "name": user.company.name,
            "country": user.company.country,
            "default_currency": user.company.default_currency,
        },
        "created_at": user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None,
        "updated_at": user.updated_at.isoformat() if hasattr(user, 'updated_at') and user.updated_at else None,
    }


def generate_employee_id(company: Company, role: str) -> str:
    """
    Generate a unique employee ID based on company and role.
    Format: {COMPANY_PREFIX}{ROLE_PREFIX}{SEQUENCE_NUMBER}
    Example: TEC-EMP-001, TEC-MGR-001, TEC-ADM-001
    """
    # Get company prefix (first 3 letters uppercase)
    company_prefix = company.name[:3].upper()
    
    # Get role prefix
    role_prefix_map = {
        'Employee': 'EMP',
        'Manager': 'MGR',
        'Admin': 'ADM',
    }
    role_prefix = role_prefix_map.get(role, 'USR')
    
    # Find the last employee ID for this company and role
    last_user = User.objects.filter(
        company=company,
        employee_id__startswith=f"{company_prefix}-{role_prefix}-"
    ).order_by('-employee_id').first()
    
    if last_user and last_user.employee_id:
        # Extract the sequence number and increment
        try:
            last_sequence = int(last_user.employee_id.split('-')[-1])
            new_sequence = last_sequence + 1
        except (ValueError, IndexError):
            new_sequence = 1
    else:
        new_sequence = 1
    
    # Generate new employee ID
    employee_id = f"{company_prefix}-{role_prefix}-{str(new_sequence).zfill(3)}"
    
    # Ensure uniqueness (in case of race conditions)
    while User.objects.filter(employee_id=employee_id).exists():
        new_sequence += 1
        employee_id = f"{company_prefix}-{role_prefix}-{str(new_sequence).zfill(3)}"
    
    return employee_id


@transaction.atomic
def create_user(*, company: Company, name: str, email: str, role: str, password: Optional[str] = None, manager: Optional[User] = None, department: Optional[str] = None) -> User:
    """
    Create a new user with auto-generated employee_id.
    Sets is_email_verified to True by default.
    """
    email = validate_email_address(email)
    
    # Auto-generate employee_id
    employee_id = generate_employee_id(company, role)
    
    data = {
        "company": company,
        "name": name,
        "email": email,
        "employee_id": employee_id,
        "role": role,
        "manager": manager,
        "department": department,
        "is_email_verified": True,  # Set to True by default
    }
    if password:
        validate_password_strength(password)
        data["password"] = make_password(password)
    return User.objects.create(**data)


@transaction.atomic
def update_user(user: User, **fields) -> User:
    for k, v in fields.items():
        if k == 'email' and v:
            v = validate_email_address(v)
        setattr(user, k, v)
    user.save()
    return user


@transaction.atomic
def delete_user(user: User) -> None:
    user.delete()


def get_user_by_id(user_id) -> Optional[User]:
    try:
        return User.objects.select_related('company').get(id=user_id)
    except User.DoesNotExist:
        return None


def list_users(
    company: Company,
    page: int = 1,
    page_size: int = 10,
    department: Optional[str] = None,
    role: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[str] = None
) -> Dict[str, Any]:
    """
    List users with pagination, filtering, and search.
    Returns a dictionary with paginated user data and metadata.
    """
    # Start with base queryset - exclude SuperAdmin and Admin roles
    queryset = User.objects.filter(company=company).select_related('company', 'manager').exclude(role__in=['SuperAdmin', 'Admin'])
    
    # Apply filters
    if department:
        queryset = queryset.filter(department__iexact=department)
    
    if role:
        queryset = queryset.filter(role=role)
    
    if is_active is not None and is_active != '':
        # Convert string to boolean
        active_bool = is_active.lower() in ['true', '1', 'yes']
        queryset = queryset.filter(is_active=active_bool)
    
    # Apply search across multiple fields
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) |
            Q(email__icontains=search) |
            Q(employee_id__icontains=search) |
            Q(department__icontains=search)
        )
    
    # Order by most recent first
    queryset = queryset.order_by('-created_at')
    
    # Get total count before pagination
    total_count = queryset.count()
    
    # Apply pagination
    paginator = Paginator(queryset, page_size)
    
    try:
        users_page = paginator.page(page)
    except EmptyPage:
        # If page is out of range, return empty results
        users_page = paginator.page(paginator.num_pages) if paginator.num_pages > 0 else []
    
    # Build lightweight payloads for list view
    users_data = [build_user_list_payload(user) for user in users_page] if users_page else []
    
    return {
        "users": users_data,
        "pagination": {
            "current_page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": paginator.num_pages,
            "has_next": users_page.has_next() if users_page else False,
            "has_previous": users_page.has_previous() if users_page else False,
        },
        "filters": {
            "department": department,
            "role": role,
            "search": search,
            "is_active": is_active,
        }
    }


@transaction.atomic
def set_user_active(user: User, is_active: bool) -> User:
    user.is_active = is_active
    user.save(update_fields=['is_active', 'updated_at'])
    return user


@transaction.atomic
def change_password(user: User, new_password: str) -> None:
    validate_password_strength(new_password)
    user.password = make_password(new_password)
    user.save(update_fields=['password', 'updated_at'])


# Additional services for approval system
def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate user and return user object"""
    user = authenticate(email=email, password=password)
    if user and user.is_active:
        return user
    return None


def issue_tokens_for_user(user: User) -> dict:
    """Issue JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }


def get_user_subordinates(user: User) -> Iterable[User]:
    """Get all subordinates of a user"""
    if user.role in ['Admin', 'Manager']:
        return User.objects.filter(manager=user, is_active=True)
    return User.objects.none()


def get_user_team_expenses(user: User):
    """Get expenses for user's team"""
    from apps.expenses.models import Expense
    
    if user.role == 'Admin':
        return Expense.objects.filter(company=user.company)
    elif user.role == 'Manager':
        subordinates = User.objects.filter(manager=user, is_active=True)
        return Expense.objects.filter(employee__in=subordinates)
    else:
        return Expense.objects.filter(employee=user)


def update_user_role(user: User, new_role: str, manager: Optional[User] = None) -> User:
    """Update user role and manager assignment"""
    with transaction.atomic():
        user.role = new_role
        if manager:
            user.manager = manager
        user.save()
        return user


def get_approvers_for_company(company: Company) -> Iterable[User]:
    """Get all users who can approve expenses for a company"""
    return User.objects.filter(
        company=company,
        role__in=['Admin', 'Manager'],
        is_active=True
    )


def get_user_pending_approvals(user: User):
    """Get expenses pending approval by user"""
    from apps.expenses.models import Expense
    return Expense.objects.filter(
        current_approver=user,
        status='In-Progress'
    )

