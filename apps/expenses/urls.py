from django.urls import path
from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseTrackView,
)

urlpatterns = [
    # List all expenses (with filters) or create new expense
    path('', ExpenseListCreateView.as_view(), name='expense-list-create'),
    
    # Get, update, or delete specific expense
    path('<uuid:expense_id>/', ExpenseDetailView.as_view(), name='expense-detail'),
    
    # Track specific expense (approval history and current status)
    path('<uuid:expense_id>/track/', ExpenseTrackView.as_view(), name='expense-track'),
]
