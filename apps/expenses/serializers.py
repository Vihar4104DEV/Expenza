from rest_framework import serializers
from decimal import Decimal
from apps.expenses.models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for Expense model"""
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)
    current_approver_name = serializers.CharField(source='current_approver.name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'employee', 'employee_name', 'employee_email', 'company', 'company_name',
            'amount', 'original_currency', 'converted_amount', 'category', 'description',
            'expense_date', 'status', 'current_approver', 'current_approver_name',
            'current_step', 'receipt_image', 'ocr_extracted_text', 'ocr_merchant_name',
            'ocr_extracted_amount', 'ocr_extracted_date', 'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = [
            'id', 'converted_amount', 'current_approver', 'current_step',
            'created_at', 'updated_at'
        ]


class ExpenseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Expense"""
    
    class Meta:
        model = Expense
        fields = [
            'amount', 'original_currency', 'category',
            'description', 'expense_date', 'receipt_image'
        ]
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class ExpenseUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Expense"""
    
    class Meta:
        model = Expense
        fields = [
            'amount', 'original_currency', 'category', 'description',
            'expense_date', 'receipt_image'
        ]
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class ExpenseApprovalSerializer(serializers.ModelSerializer):
    """Serializer for expense approval actions"""
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    amount_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = [
            'id', 'employee_name', 'amount', 'original_currency', 'converted_amount',
            'amount_display', 'category', 'description', 'expense_date', 'status',
            'current_step', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_amount_display(self, obj):
        if obj.converted_amount:
            return f"{obj.converted_amount} {obj.company.default_currency}"
        return f"{obj.amount} {obj.original_currency}"


class ExpenseListSerializer(serializers.ModelSerializer):
    """Simplified serializer for expense lists"""
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    amount_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = [
            'id', 'employee_name', 'amount', 'original_currency', 'converted_amount',
            'amount_display', 'category', 'expense_date', 'status', 'created_at'
        ]
    
    def get_amount_display(self, obj):
        if obj.converted_amount:
            return f"{obj.converted_amount} {obj.company.default_currency}"
        return f"{obj.amount} {obj.original_currency}"


class OCRReceiptSerializer(serializers.Serializer):
    """Serializer for OCR receipt processing"""
    receipt_image = serializers.ImageField(required=True)
    
    def validate_receipt_image(self, value):
        # Add image validation if needed
        if value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("Image size should not exceed 10MB")
        return value
