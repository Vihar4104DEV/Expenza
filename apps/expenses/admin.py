from django.contrib import admin
from django.utils.html import format_html

from .models import Expense, ExpenseLineItem


class ExpenseLineItemInline(admin.TabularInline):
    """Inline admin for expense line items."""
    model = ExpenseLineItem
    extra = 0
    readonly_fields = ('id', 'created_at')
    fields = ('description', 'quantity', 'unit_price', 'total_price', 'category', 'ocr_confidence')


@admin.register(ExpenseLineItem)
class ExpenseLineItemAdmin(admin.ModelAdmin):
    """Admin for expense line items."""
    list_display = ('expense', 'description', 'total_price', 'category', 'ocr_confidence', 'created_at')
    list_filter = ('category', 'expense__status')
    search_fields = ('description', 'expense__employee__name')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """Enhanced admin for expenses with OCR features."""
    list_display = (
        "employee",
        "company",
        "amount",
        "original_currency",
        "status",
        "processing_status",
        "ocr_confidence_display",
        "has_receipt",
        "created_at"
    )
    search_fields = ("employee__name", "employee__email", "description", "ocr_merchant_name")
    list_filter = ("status", "processing_status", "category", "company", "ocr_confidence_score")

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'ocr_extracted_text_display',
        'receipt_image_preview'
    )

    inlines = [ExpenseLineItemInline]

    fieldsets = (
        ('Basic Information', {
            'fields': (
                'employee',
                'company',
                'amount',
                'original_currency',
                'converted_amount',
                'category',
                'description',
                'expense_date'
            )
        }),
        ('Receipt & OCR Data', {
            'fields': (
                'receipt_image',
                'receipt_image_preview',
                'processing_status',
                'ocr_confidence_score',
                'ocr_merchant_name',
                'ocr_extracted_amount',
                'ocr_extracted_currency',
                'ocr_extracted_date',
                'merchant_address',
                'receipt_total',
                'tax_amount',
                'ocr_extracted_text_display',
            ),
            'classes': ('collapse',)
        }),
        ('Approval Workflow', {
            'fields': (
                'status',
                'current_approver',
                'current_step'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def ocr_confidence_display(self, obj):
        """Display OCR confidence score with color coding."""
        if obj.ocr_confidence_score is None:
            return "N/A"

        confidence = obj.ocr_confidence_score
        if confidence >= 0.8:
            color = "green"
        elif confidence >= 0.5:
            color = "orange"
        else:
            color = "red"

        return format_html(
            '<span style="color: {};">{:.1%}</span>',
            color,
            confidence
        )
    ocr_confidence_display.short_description = "OCR Confidence"
    ocr_confidence_display.admin_order_field = "ocr_confidence_score"

    def has_receipt(self, obj):
        """Display if expense has receipt image."""
        return "✓" if obj.receipt_image else "✗"
    has_receipt.short_description = "Receipt"
    has_receipt.boolean = True

    def ocr_extracted_text_display(self, obj):
        """Display OCR extracted text in a readable format."""
        if not obj.ocr_extracted_text:
            return "No OCR text available"

        # Truncate long text for admin display
        text = obj.ocr_extracted_text[:500]
        if len(obj.ocr_extracted_text) > 500:
            text += "..."

        return format_html('<pre style="white-space: pre-wrap;">{}</pre>', text)
    ocr_extracted_text_display.short_description = "OCR Extracted Text"

    def receipt_image_preview(self, obj):
        """Display receipt image preview."""
        if obj.receipt_image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px;" />',
                obj.receipt_image.url
            )
        return "No image"
    receipt_image_preview.short_description = "Receipt Preview"

    # Add custom actions
    actions = ['reprocess_ocr', 'mark_processing_completed']

    def reprocess_ocr(self, request, queryset):
        """Reprocess OCR for selected expenses."""
        from .services import process_receipt_ocr

        processed = 0
        for expense in queryset:
            if expense.receipt_image:
                process_receipt_ocr(expense)
                processed += 1

        self.message_user(request, f"Reprocessed OCR for {processed} expenses.")
    reprocess_ocr.short_description = "Reprocess OCR for selected expenses"

    def mark_processing_completed(self, request, queryset):
        """Mark processing status as completed."""
        updated = queryset.update(processing_status='completed')
        self.message_user(request, f"Marked {updated} expenses as processing completed.")
    mark_processing_completed.short_description = "Mark processing as completed"
