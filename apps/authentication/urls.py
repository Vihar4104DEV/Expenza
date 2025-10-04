from django.urls import path

from .views import (
    AdminRegisterView,
    OTPRequestView,
    OTPVerifyView,
    LoginView,
    PasswordChangeView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)


urlpatterns = [
    path('register/admin/', AdminRegisterView.as_view(), name='admin-register'),
    path('otp/request/', OTPRequestView.as_view(), name='otp-request'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('login/', LoginView.as_view(), name='login'),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    path('password/reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
