from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework import serializers
from decimal import Decimal

from .models import Expense, ExpenseLineItem

User = get_user_model()


class ExpenseCreateSerializer(serializers.Serializer):
    """Serializer for creating a new expense request."""
    
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    original_currency = serializers.CharField(max_length=10)
    category = serializers.ChoiceField(choices=Expense.CATEGORY_CHOICES)
    description = serializers.CharField()
    expense_date = serializers.DateField()
    receipt_image = serializers.ImageField(required=False, allow_null=True)
    
    def validate_amount(self, value):
        """Validate amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
    
    def validate_description(self, value):
        """Validate description is not empty."""
        if not value or value.strip() == '':
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


class ExpenseUpdateSerializer(serializers.Serializer):
    """Serializer for updating an expense request (only if status is Pending)."""
    
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'), required=False)
    original_currency = serializers.CharField(max_length=10, required=False)
    category = serializers.ChoiceField(choices=Expense.CATEGORY_CHOICES, required=False)
    description = serializers.CharField(required=False)
    expense_date = serializers.DateField(required=False)
    receipt_image = serializers.ImageField(required=False, allow_null=True)
    
    def validate_amount(self, value):
        """Validate amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
    
    def validate_description(self, value):
        """Validate description is not empty."""
        if value is not None and value.strip() == '':
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip() if value else value


class ExpenseListSerializer(serializers.Serializer):
    """Lightweight serializer for expense listing."""
    
    id = serializers.UUIDField()
    employee_name = serializers.CharField()
    employee_email = serializers.CharField()
    employee_id = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    original_currency = serializers.CharField()
    category = serializers.CharField()
    expense_date = serializers.DateField()
    status = serializers.CharField()
    current_approver_name = serializers.CharField(allow_null=True)
    current_step = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    

class ApprovalHistorySerializer(serializers.Serializer):
    """Serializer for approval history tracking."""
    
    step_number = serializers.IntegerField()
    approver_name = serializers.CharField()
    approver_email = serializers.CharField()
    decision = serializers.CharField()
    comments = serializers.CharField(allow_null=True)
    decided_at = serializers.DateTimeField(allow_null=True)
    created_at = serializers.DateTimeField()


class ExpenseDetailSerializer(serializers.Serializer):
    """Detailed serializer for a single expense with full tracking information."""
    
    id = serializers.UUIDField()
    employee = serializers.DictField()
    company = serializers.DictField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    original_currency = serializers.CharField()
    converted_amount = serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True)
    category = serializers.CharField()
    description = serializers.CharField()
    expense_date = serializers.DateField()
    status = serializers.CharField()
    current_approver = serializers.DictField(allow_null=True)
    current_step = serializers.IntegerField()
    receipt_image = serializers.CharField(allow_null=True)
    ocr_extracted_text = serializers.CharField(allow_null=True)
    ocr_merchant_name = serializers.CharField(allow_null=True)
    ocr_extracted_amount = serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True)
    ocr_extracted_date = serializers.DateField(allow_null=True)
    approval_history = ApprovalHistorySerializer(many=True)
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()


class OCRReceiptUploadSerializer(serializers.Serializer):
    """Serializer for OCR receipt upload."""

    receipt_image = serializers.ImageField(required=True)
    category = serializers.ChoiceField(choices=Expense.CATEGORY_CHOICES, required=False)
    description = serializers.CharField(required=False, allow_blank=True)

    def validate_receipt_image(self, value):
        """Validate receipt image file."""
        max_size = getattr(settings, 'OCR_MAX_IMAGE_SIZE', 10485760)  # 10MB default
        if value.size > max_size:
            max_mb = max_size / (1024 * 1024)
            raise serializers.ValidationError(f"Image file too large. Maximum size is {max_mb:.1f}MB.")

        supported_formats = getattr(settings, 'OCR_SUPPORTED_FORMATS', ['image/jpeg', 'image/jpg', 'image/png'])
        if value.content_type not in supported_formats:
            formats_str = ', '.join([f.split('/')[-1].upper() for f in supported_formats])
            raise serializers.ValidationError(f"Unsupported file format. Supported formats: {formats_str}")

        return value


class ExpenseLineItemSerializer(serializers.Serializer):
    """Serializer for expense line items."""

    id = serializers.UUIDField(read_only=True)
    description = serializers.CharField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    category = serializers.CharField(allow_null=True)
    ocr_confidence = serializers.FloatField(allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)


class OCRResultSerializer(serializers.Serializer):
    """Serializer for OCR processing results."""

    success = serializers.BooleanField()
    confidence_score = serializers.FloatField(allow_null=True)
    extracted_data = serializers.DictField(allow_null=True)
    error = serializers.CharField(allow_null=True)


class CurrencyConversionSerializer(serializers.Serializer):
    """Serializer for currency conversion requests."""

    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    from_currency = serializers.CharField(max_length=3)
    to_currency = serializers.CharField(max_length=3)


class CountryCurrencySerializer(serializers.Serializer):
    """Serializer for country and currency data."""

    countries = serializers.DictField()


class EnhancedExpenseDetailSerializer(ExpenseDetailSerializer):
    """Enhanced expense detail serializer with OCR fields."""

    ocr_extracted_currency = serializers.CharField(allow_null=True)
    ocr_confidence_score = serializers.FloatField(allow_null=True)
    merchant_address = serializers.CharField(allow_null=True)
    receipt_total = serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True)
    processing_status = serializers.CharField()
    line_items = ExpenseLineItemSerializer(many=True, read_only=True)
