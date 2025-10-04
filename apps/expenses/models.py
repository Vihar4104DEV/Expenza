from decimal import Decimal
from django.db import models

from apps.core.models import BaseModel


class Expense(BaseModel):
    """Employee expense claims and OCR-enriched metadata.

    Denotes:
    - A single expense filed by an employee that moves through approvals.

    Why:
    - Tracks amounts in original and company currency for reporting.
    - `current_approver` and `current_step` support stateful workflows.
    - OCR fields store extracted info enabling automation and validation.
    """

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In-Progress", "In-Progress"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    CATEGORY_CHOICES = [
        ("Travel", "Travel"),
        ("Food", "Food & Dining"),
        ("Accommodation", "Accommodation"),
        ("Office", "Office Supplies"),
        ("Transport", "Transportation"),
        ("Entertainment", "Client Entertainment"),
        ("Other", "Other"),
    ]

    employee = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='expenses',
        limit_choices_to={'role': 'Employee'},
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='expenses',
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    original_currency = models.CharField(max_length=10)
    converted_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Amount converted to company's default currency",
    )

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    expense_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending',
    )
    current_approver = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pending_approvals',
        help_text="Current person who needs to approve",
    )
    current_step = models.IntegerField(
        default=0,
        help_text="Current approval step (0 = manager, 1+ = workflow steps)",
    )

    receipt_image = models.ImageField(upload_to='receipts/', null=True, blank=True)
    ocr_extracted_text = models.TextField(blank=True, null=True)
    ocr_merchant_name = models.CharField(max_length=255, blank=True, null=True)
    ocr_extracted_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    ocr_extracted_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'expenses'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.employee.name} - {self.amount} {self.original_currency} ({self.status})"
