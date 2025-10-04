"""Users service layer.

Centralizes database operations and business rules for users:
- Admin/company bootstrap, user CRUD, activation, and password flows.
"""

from typing import Optional, Tuple, Iterable

from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.db import transaction

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


@transaction.atomic
def create_user(*, company: Company, name: str, email: str, employee_id: str, role: str, password: Optional[str] = None, manager: Optional[User] = None) -> User:
    email = validate_email_address(email)
    data = {
        "company": company,
        "name": name,
        "email": email,
        "employee_id": employee_id,
        "role": role,
        "manager": manager,
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


def list_users(company: Company) -> Iterable[User]:
    return User.objects.filter(company=company).select_related('company').order_by('-created_at').exclude(role__in=['SuperAdmin','Admin'])


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

