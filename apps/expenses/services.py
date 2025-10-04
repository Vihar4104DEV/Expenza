"""Expense service layer.

Centralizes database operations and business rules for expenses:
- Expense CRUD, listing with role-based filtering, approval tracking.
- OCR processing for receipt auto-extraction
- Currency conversion and country lookup services
"""

import re
import requests
import logging
from io import BytesIO
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings
from decimal import Decimal, InvalidOperation
from PIL import Image
import pytesseract

from apps.companies.models import Company
from apps.approvals.models import ExpenseApproval
from .models import Expense, ExpenseLineItem

User = get_user_model()


def convert_currency(amount: Decimal, from_currency: str, company: Company) -> Decimal:
    """
    Convert amount from original currency to company's default currency.
    For now, this is a placeholder - implement actual currency conversion logic.
    """
    # Handle None values
    if not amount or not from_currency or not company or not company.default_currency:
        logger.warning(f"Invalid parameters for currency conversion: amount={amount}, from_currency={from_currency}, company={company}")
        return amount or Decimal('0.00')

    # For now, just return the original amount if currencies match
    if from_currency == company.default_currency:
        return amount

    # Try to use the new currency conversion API
    try:
        converted = convert_currency_api(amount, from_currency, company.default_currency)
        return converted if converted is not None else amount
    except Exception as e:
        logger.warning(f"Currency conversion failed, using original amount: {str(e)}")
        return amount


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


# ========== OCR AND CURRENCY SERVICES ==========

logger = logging.getLogger(__name__)


def get_countries_and_currencies() -> Dict[str, Any]:
    """
    Fetch countries and their currencies from REST Countries API.
    Returns cached data to avoid repeated API calls.
    """
    try:
        timeout = getattr(settings, 'COUNTRIES_API_TIMEOUT', 10)
        response = requests.get(
            'https://restcountries.com/v3.1/all?fields=name,currencies',
            timeout=timeout
        )
        response.raise_for_status()

        countries_data = response.json()
        processed_data = {}

        for country in countries_data:
            country_name = country.get('name', {}).get('common', '')
            currencies = country.get('currencies', {})

            if country_name and currencies:
                currency_codes = list(currencies.keys())
                processed_data[country_name] = {
                    'currencies': currency_codes,
                    'primary_currency': currency_codes[0] if currency_codes else None
                }

        return processed_data
    except Exception as e:
        logger.error(f"Failed to fetch countries and currencies: {str(e)}")
        return {}


def convert_currency_api(amount: Decimal, from_currency: str, to_currency: str) -> Optional[Decimal]:
    """
    Convert currency using Exchange Rate API.
    """
    if from_currency == to_currency:
        return amount

    try:
        timeout = getattr(settings, 'CURRENCY_API_TIMEOUT', 10)
        response = requests.get(
            f'https://api.exchangerate-api.com/v4/latest/{from_currency}',
            timeout=timeout
        )
        response.raise_for_status()

        data = response.json()
        rates = data.get('rates', {})

        if to_currency not in rates:
            logger.error(f"Currency {to_currency} not found in exchange rates")
            return None

        exchange_rate = Decimal(str(rates[to_currency]))
        converted_amount = amount * exchange_rate

        return converted_amount.quantize(Decimal('0.01'))
    except Exception as e:
        logger.error(f"Currency conversion failed: {str(e)}")
        return None


def extract_text_from_image(image_file: InMemoryUploadedFile) -> str:
    """
    Extract text from image using OCR (Tesseract).
    """
    try:
        # Configure Tesseract path if specified in settings
        if hasattr(settings, 'TESSERACT_CMD') and settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

        # Convert uploaded file to PIL Image
        image = Image.open(image_file)

        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Check file size limits
        max_size = getattr(settings, 'OCR_MAX_IMAGE_SIZE', 10485760)  # 10MB default
        if image_file.size > max_size:
            logger.warning(f"Image file too large: {image_file.size} bytes, max: {max_size}")
            return ""

        # Check supported formats
        supported_formats = getattr(settings, 'OCR_SUPPORTED_FORMATS', ['image/jpeg', 'image/jpg', 'image/png'])
        if image_file.content_type not in supported_formats:
            logger.warning(f"Unsupported image format: {image_file.content_type}")
            return ""

        # Extract text using Tesseract
        extracted_text = pytesseract.image_to_string(image)

        return extracted_text.strip()
    except Exception as e:
        logger.error(f"OCR text extraction failed: {str(e)}")
        return ""


def parse_receipt_data(ocr_text: str) -> Dict[str, Any]:
    """
    Parse OCR text to extract structured receipt data.
    This is a basic implementation - you can enhance with ML models.
    """
    data = {
        'merchant_name': None,
        'total_amount': None,
        'currency': None,
        'date': None,
        'tax_amount': None,
        'line_items': [],
        'confidence_score': 0.0
    }

    try:
        # Handle None or empty OCR text
        if not ocr_text or ocr_text.strip() == '':
            logger.warning("OCR text is None or empty")
            return data

        # Safely split lines
        try:
            lines = [line.strip() for line in ocr_text.split('\n') if line and line.strip()]
        except Exception as e:
            logger.error(f"Error splitting OCR text into lines: {str(e)}")
            return data

        # Extract merchant name (usually first few lines)
        for i, line in enumerate(lines[:5]):
            if len(line) > 5 and not re.search(r'\d', line):
                data['merchant_name'] = line
                break

        # Extract amounts using regex
        amount_patterns = [
            r'total[:\s]*([A-Z]{3})?[\s]*(\d+[.,]\d{2})',
            r'amount[:\s]*([A-Z]{3})?[\s]*(\d+[.,]\d{2})',
            r'(\d+[.,]\d{2})\s*([A-Z]{3})',
            r'([A-Z]{3})\s*(\d+[.,]\d{2})'
        ]

        for line in lines:
            try:
                # Ensure line is not None
                if not line:
                    continue
                line_lower = line.lower()
                for pattern in amount_patterns:
                    try:
                        match = re.search(pattern, line_lower, re.IGNORECASE)
                        if match:
                            # Extract amount and currency
                            groups = match.groups()
                            amount_str = None
                            currency_str = None

                            for group in groups:
                                if group and re.match(r'\d+[.,]\d{2}', group):
                                    amount_str = group.replace(',', '.')
                                elif group and re.match(r'[A-Z]{3}', group.upper()):
                                    currency_str = group.upper()

                            if amount_str:
                                data['total_amount'] = Decimal(amount_str)
                                if currency_str:
                                    data['currency'] = currency_str
                                break
                    except (ValueError, InvalidOperation, TypeError) as e:
                        logger.warning(f"Error processing amount pattern: {str(e)}")
                        continue
            except Exception as e:
                logger.warning(f"Error processing line for amounts: {str(e)}")
                continue

        # Extract date
        date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{1,2}\s+\w+\s+\d{2,4})',
            r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})'
        ]

        for line in lines:
            try:
                if not line:
                    continue
                for pattern in date_patterns:
                    try:
                        match = re.search(pattern, line)
                        if match:
                            date_str = match.group(1)
                            if not date_str:
                                continue
                            # Try to parse date
                            for date_format in ['%d/%m/%Y', '%m/%d/%Y', '%Y-%m-%d', '%d-%m-%Y']:
                                try:
                                    parsed_date = datetime.strptime(date_str, date_format).date()
                                    data['date'] = parsed_date
                                    break
                                except ValueError:
                                    continue
                            if data['date']:
                                break
                    except Exception as e:
                        logger.warning(f"Error processing date pattern: {str(e)}")
                        continue
            except Exception as e:
                logger.warning(f"Error processing line for dates: {str(e)}")
                continue

        # Extract tax amount
        tax_patterns = [
            r'tax[:\s]*(\d+[.,]\d{2})',
            r'vat[:\s]*(\d+[.,]\d{2})',
            r'gst[:\s]*(\d+[.,]\d{2})'
        ]

        for line in lines:
            try:
                if not line:
                    continue
                line_lower = line.lower()
                for pattern in tax_patterns:
                    try:
                        match = re.search(pattern, line_lower)
                        if match and match.group(1):
                            tax_amount = Decimal(match.group(1).replace(',', '.'))
                            data['tax_amount'] = tax_amount
                            break
                    except (ValueError, InvalidOperation, TypeError) as e:
                        logger.warning(f"Error processing tax pattern: {str(e)}")
                        continue
            except Exception as e:
                logger.warning(f"Error processing line for tax: {str(e)}")
                continue

        # Simple confidence scoring based on extracted data
        confidence = 0.0
        if data['merchant_name']:
            confidence += 0.2
        if data['total_amount']:
            confidence += 0.4
        if data['currency']:
            confidence += 0.2
        if data['date']:
            confidence += 0.2

        data['confidence_score'] = min(confidence, 1.0)

        return data

    except Exception as e:
        logger.error(f"Unexpected error in parse_receipt_data: {str(e)}", exc_info=True)
        return {
            'merchant_name': None,
            'total_amount': None,
            'currency': None,
            'date': None,
            'tax_amount': None,
            'line_items': [],
            'confidence_score': 0.0
        }


@transaction.atomic
def process_receipt_ocr(expense: Expense) -> Dict[str, Any]:
    """
    Process receipt image with OCR and update expense with extracted data.
    """
    if not expense.receipt_image:
        return {'success': False, 'error': 'No receipt image found'}

    try:
        # Update processing status
        expense.processing_status = 'processing'
        expense.save(update_fields=['processing_status'])

        # Extract text from image
        extracted_text = extract_text_from_image(expense.receipt_image)

        if not extracted_text or extracted_text.strip() == '':
            expense.processing_status = 'failed'
            expense.save(update_fields=['processing_status'])
            return {'success': False, 'error': 'No text could be extracted from image'}

        # Parse receipt data
        receipt_data = parse_receipt_data(extracted_text)

        # Update expense with OCR data
        expense.ocr_extracted_text = extracted_text
        expense.ocr_confidence_score = receipt_data['confidence_score']

        if receipt_data['merchant_name']:
            expense.ocr_merchant_name = receipt_data['merchant_name']

        if receipt_data['total_amount']:
            expense.ocr_extracted_amount = receipt_data['total_amount']
            expense.receipt_total = receipt_data['total_amount']

        if receipt_data['currency']:
            expense.ocr_extracted_currency = receipt_data['currency']

        if receipt_data['date']:
            expense.ocr_extracted_date = receipt_data['date']

        if receipt_data['tax_amount']:
            expense.tax_amount = receipt_data['tax_amount']

        # Auto-fill expense fields if they weren't provided
        if not expense.description and receipt_data['merchant_name']:
            expense.description = f"Expense at {receipt_data['merchant_name']}"

        if not expense.amount and receipt_data['total_amount']:
            expense.amount = receipt_data['total_amount']

        if not expense.original_currency and receipt_data['currency']:
            expense.original_currency = receipt_data['currency']
            # Recalculate converted amount
            expense.converted_amount = convert_currency_api(
                expense.amount,
                expense.original_currency,
                expense.company.default_currency
            ) or expense.amount

        if not expense.expense_date and receipt_data['date']:
            expense.expense_date = receipt_data['date']

        expense.processing_status = 'completed'
        expense.save()

        return {
            'success': True,
            'extracted_data': receipt_data,
            'confidence_score': receipt_data['confidence_score']
        }

    except Exception as e:
        logger.error(f"OCR processing failed for expense {expense.id}: {str(e)}")
        expense.processing_status = 'failed'
        expense.save(update_fields=['processing_status'])
        return {'success': False, 'error': str(e)}


@transaction.atomic
def create_expense_with_ocr(
    *,
    employee: User,
    company: Company,
    receipt_image: InMemoryUploadedFile,
    **additional_fields
) -> Tuple[Expense, Dict[str, Any]]:
    """
    Create expense from receipt image using OCR auto-extraction.
    """
    # Create basic expense with receipt
    expense = Expense.objects.create(
        employee=employee,
        company=company,
        receipt_image=receipt_image,
        processing_status='pending',
        status='Pending',
        # Default values that might be overridden by OCR
        amount=additional_fields.get('amount', Decimal('0.00')),
        original_currency=additional_fields.get('original_currency', company.default_currency),
        category=additional_fields.get('category', 'Other'),
        description=additional_fields.get('description', 'OCR Processing...'),
        expense_date=additional_fields.get('expense_date', datetime.now().date()),
        **{k: v for k, v in additional_fields.items()
           if k not in ['amount', 'original_currency', 'category', 'description', 'expense_date']}
    )

    # Process OCR
    ocr_result = process_receipt_ocr(expense)

    # Set up approval workflow if needed
    if employee.manager and employee.is_manager_approver:
        expense.current_approver = employee.manager
        expense.current_step = 0
        expense.save(update_fields=['current_approver', 'current_step'])

        # Create initial approval record
        ExpenseApproval.objects.create(
            expense=expense,
            approver=employee.manager,
            step_number=0,
            decision='Pending',
        )

    return expense, ocr_result
