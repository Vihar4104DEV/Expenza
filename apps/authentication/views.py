from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import permissions,status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from rest_framework import serializers

from apps.core.utils.response_wrapper import api_response
from apps.core.email_service import send_email
from apps.users.services import (
    create_company_and_admin,
    build_user_payload,
    change_password,
)
from apps.core.utils.exceptions import extract_first_error_message
from .services import issue_otp, verify_otp, authenticate_user, issue_tokens_for_user
from .serializers.auth_serializers import (
    AdminRegisterSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    LoginSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()


class AdminRegisterView(APIView):
    """Register a company and its Admin user, then send OTP to verify email."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            serializer = AdminRegisterSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            print(data)
            company, admin_user = create_company_and_admin(
                name=data["company_name"],
                country=data["country"],
                default_currency=data["default_currency"],
                admin_name=data["admin_name"],
                admin_email=data["admin_email"],
                password=data["password"],
                employee_id=data["company_name"][:3].upper() + "001",
            )
            # Issue OTP for email verification
            otp = issue_otp(data["admin_email"], purpose="email_verification")
            send_email(
                subject="Verify your email",
                body_text=f"Your verification code is: {otp.code}",
                to=[data["admin_email"]],
            )
            payload = build_user_payload(admin_user)
            return api_response(data={"user": payload}, message="Admin registered. OTP sent to email.")
        except Exception as e:
            # Handle validation errors
            if hasattr(e, 'detail'):
                error_message = extract_first_error_message(e.detail)
                return api_response(
                    data=None,
                    message=error_message,
                    status_code=status.HTTP_400_BAD_REQUEST,
                    success=False
                )
            
            # Handle unexpected errors
            print(f"Error during admin registration: {str(e)}")
            return api_response(
                data=None,
                message="SignUp Failed",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False
            )

class OTPRequestView(APIView):
    """Request an OTP for email verification or password reset."""

    def post(self, request):
        try:
            serializer = OTPRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            otp = issue_otp(data["email"], purpose=data["purpose"])
            subject = "Email Verification Code" if data["purpose"] == "email_verification" else "Password Reset Code"
            send_email(
                subject=subject,
                body_text=f"Your OTP code is: {otp.code}",
                to=[data["email"]],
            )
            return api_response(message="OTP sent to email")
        except Exception as e:
            # Handle validation errors
            if hasattr(e, 'detail'):
                error_message = extract_first_error_message(e.detail)
                return api_response(
                    data=None,
                    message=error_message,
                    status_code=status.HTTP_400_BAD_REQUEST,
                    success=False
                )
            
            # Handle unexpected errors
            print(f"Error during admin registration: {str(e)}")
            return api_response(
                data=None,
                message="SignUp Failed",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False
            )


class OTPVerifyView(APIView):
    """Verify OTP. If purpose is email_verification, mark user email verified."""
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        try:
            serializer = OTPVerifySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            user = None
            ok = verify_otp(data["email"], data["purpose"], data["code"])
            if not ok:
                return api_response(message="Invalid or expired OTP", status_code=400)
            if data["purpose"] == "email_verification":
                try:
                    user = User.objects.get(email=data["email"])  # defaults manager hides deleted
                    user.is_email_verified = True
                    user.save(update_fields=["is_email_verified", "updated_at"])
                except User.DoesNotExist:
                    pass
            tokens = issue_tokens_for_user(user)
            payload = build_user_payload(user)
            payload.update({"tokens": tokens})
            return api_response(message="OTP verified", data=payload)
        except Exception as e:
            # Handle validation errors
            if hasattr(e, 'detail'):
                error_message = extract_first_error_message(e.detail)
                return api_response(
                    data=None,
                    message=error_message,
                    status_code=status.HTTP_400_BAD_REQUEST,
                    success=False
                )
            
            # Handle unexpected errors
            print(f"Error during admin registration: {str(e)}")
            return api_response(
                data=None,
                message="SignUp Failed",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False
            )


class LoginView(APIView):
    """Login with email/password and receive JWT tokens."""
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            user = authenticate_user(data["email"], data["password"])
            print("user",user)
            if not user:
                return api_response(message="Invalid credentials", status_code=401)
            print("user",user)
            if not user.is_active or user.deleted_at:
                return api_response(message="User is inactive", status_code=403)
            print("before generating tokens")
            tokens = issue_tokens_for_user(user)
            print("tokens",tokens)
            payload = build_user_payload(user)
            payload.update({"tokens": tokens})
            print("payload",payload)
            return api_response(data=payload, message="Login successful")
        except serializers.ValidationError as e:
            return api_response(message="Validation Error", error=e.detail, status_code=400)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = PasswordChangeSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            new_password = serializer.validated_data["new_password"]
            change_password(request.user, new_password)
            return api_response(message="Password changed successfully")
        except serializers.ValidationError as e:
            return api_response(message="Validation Error", error=e.detail, status_code=400)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


class PasswordResetRequestView(APIView):
    def post(self, request):
        try:
            serializer = PasswordResetRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            email = serializer.validated_data["email"]
            otp = issue_otp(email, purpose="password_reset")
            send_email(
                subject="Password Reset Code",
                body_text=f"Your OTP code is: {otp.code}",
                to=[email],
            )
            return api_response(message="Password reset OTP sent")
        except serializers.ValidationError as e:
            return api_response(message="Validation Error", error=e.detail, status_code=400)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


class PasswordResetConfirmView(APIView):
    def post(self, request):
        try:
            serializer = PasswordResetConfirmSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            if not verify_otp(data["email"], "password_reset", data["code"]):
                return api_response(message="Invalid or expired OTP", status_code=400)
            try:
                user = User.objects.get(email=data["email"])
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=404)
            change_password(user, data["new_password"])
            return api_response(message="Password reset successful")
        except serializers.ValidationError as e:
            return api_response(message="Validation Error", error=e.detail, status_code=400)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)
