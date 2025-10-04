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
    ocr_extracted_currency = models.CharField(max_length=10, blank=True, null=True)
    ocr_confidence_score = models.FloatField(null=True, blank=True, help_text="OCR accuracy confidence (0-1)")
    merchant_address = models.TextField(blank=True, null=True)
    receipt_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    processing_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending',
        help_text="OCR processing status"
    )

    class Meta:
        db_table = 'expenses'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.employee.name} - {self.amount} {self.original_currency} ({self.status})"


class ExpenseLineItem(BaseModel):
    """Individual line items extracted from receipt via OCR.

    Denotes:
    - Individual items/services listed on a receipt
    - Useful for detailed expense breakdowns and validation

    Why:
    - Enables line-by-line expense tracking
    - Helps with expense categorization and audit trails
    - Provides detailed receipt reconstruction
    """

    expense = models.ForeignKey(
        Expense,
        on_delete=models.CASCADE,
        related_name='line_items'
    )

    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=50, choices=Expense.CATEGORY_CHOICES, blank=True, null=True)

    # OCR confidence for this line item
    ocr_confidence = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'expense_line_items'
        ordering = ['created_at']

    def __str__(self) -> str:
        return f"{self.expense.id} - {self.description} ({self.total_price})"
