from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.core.validators import validate_email_address, validate_password_strength
from apps.users.services import build_user_payload
from apps.companies.models import Company
from ..services import issue_otp, verify_otp

User = get_user_model()


class AdminRegisterSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=255)
    country = serializers.CharField(max_length=100)
    default_currency = serializers.CharField(max_length=10)
    admin_name = serializers.CharField(max_length=255)
    admin_email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    employee_id = serializers.CharField(max_length=50,required=False)

    def validate_company_name(self, value):
        """Ensure company name is unique."""
        if Company.objects.filter(name__iexact=value.strip()).exists():
            raise serializers.ValidationError("A company with this name already exists. Please choose a different name.")
        return value.strip()

    def validate_admin_email(self, value):
        email = validate_email_address(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email
    
    def validate_employee_id(self,value):
        company_name = self.data.get("company_name", "")
        return company_name[:3].upper() + "001"


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=[("email_verification", "email_verification"), ("password_reset", "password_reset")])

    def validate_email(self, value):
        return validate_email_address(value)


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=[("email_verification", "email_verification"), ("password_reset", "password_reset")])
    code = serializers.CharField(max_length=6)

    def validate_email(self, value):
        return validate_email_address(value)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return validate_email_address(value)


class PasswordChangeSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password_strength(value)
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return validate_email_address(value)


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return validate_email_address(value)

    def validate_new_password(self, value):
        validate_password_strength(value)
        return value
