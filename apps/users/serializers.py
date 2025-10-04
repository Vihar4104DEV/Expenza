from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.core.validators import validate_email_address, validate_password_strength
from apps.users.services import build_user_payload

User = get_user_model()


class UserCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    employee_id = serializers.CharField(max_length=50)
    role = serializers.ChoiceField(choices=[("Admin", "Admin"), ("Manager", "Manager"), ("Employee", "Employee")])
    password = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    manager_id = serializers.UUIDField(required=False, allow_null=True)

    def validate_email(self, value):
        email = validate_email_address(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value):
        if value:
            validate_password_strength(value)
        return value


class UserUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    email = serializers.EmailField(required=False)
    role = serializers.ChoiceField(choices=[("Admin", "Admin"), ("Manager", "Manager"), ("Employee", "Employee")], required=False)
    manager_id = serializers.UUIDField(required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False)

    def validate_email(self, value):
        email = validate_email_address(value)
        if self.instance and self.instance.email == email:
            return email  # No change
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email


class UserDetailSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()
    employee_id = serializers.CharField()
    role = serializers.CharField()
    is_active = serializers.BooleanField()
    is_email_verified = serializers.BooleanField()
    company = serializers.DictField()

    @staticmethod
    def from_user(user: User) -> dict:
        return build_user_payload(user)