import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings

from apps.core.models import BaseModel


class UserManager(BaseUserManager):
    """Custom user manager for the project's `User` model.

    Why:
    - Centralizes user creation logic and normalization (e.g., email).
    - Keeps password hashing in one place via `set_password`.
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, BaseModel):
    """Application user with minimal role model and reporting structure.

    Denotes:
    - A person authenticated into the system belonging to a `Company`.

    Why:
    - Email as username aligns with modern auth flows.
    - `role` kept simple (Admin/Manager/Employee) and scalable.
    - `manager` FK enables hierarchical approvals.
    - `is_manager_approver` toggles whether manager is the first approver.
    """

    ROLE_CHOICES = [
        ("Admin", "Admin"),
        ("Manager", "Manager"),
        ("Employee", "Employee"),
    ]

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='users',
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    mobile_no = models.CharField(max_length=15, blank=True, null=True)
    employee_id = models.CharField(max_length=50, unique=True)
    is_email_verified = models.BooleanField(
        default=False,
        help_text="Set to True when the user verifies email via OTP",
    )

    # Optional org context
    department = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Department name for organizational structure",
    )

    # Role and reporting
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Employee')
    manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates',
    )
    is_manager_approver = models.BooleanField(
        default=False,
        help_text="If checked, expense first goes to manager for approval",
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'employee_id', 'company']

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def __str__(self) -> str:
        return f"{self.name} ({self.role})"

