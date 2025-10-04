from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.expenses.views import ExpenseViewSet

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
]
