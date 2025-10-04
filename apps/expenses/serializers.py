from django.contrib.auth import get_user_model
from rest_framework import serializers
from decimal import Decimal

from .models import Expense

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
