from django.urls import path
from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseTrackView,
    OCRReceiptUploadView,
    OCRProcessView,
    CurrencyConversionView,
    CountriesCurrenciesView,
)

urlpatterns = [
    # List all expenses (with filters) or create new expense
    path('', ExpenseListCreateView.as_view(), name='expense-list-create'),
    
    # Get, update, or delete specific expense
    path('<uuid:expense_id>/', ExpenseDetailView.as_view(), name='expense-detail'),
    
    # Track specific expense (approval history and current status)
    path('<uuid:expense_id>/track/', ExpenseTrackView.as_view(), name='expense-track'),

    # OCR and Currency API endpoints
    path('ocr/upload/', OCRReceiptUploadView.as_view(), name='ocr-upload'),
    path('<uuid:expense_id>/ocr/process/', OCRProcessView.as_view(), name='ocr-process'),
    path('currency/convert/', CurrencyConversionView.as_view(), name='currency-convert'),
    path('countries-currencies/', CountriesCurrenciesView.as_view(), name='countries-currencies'),
]
