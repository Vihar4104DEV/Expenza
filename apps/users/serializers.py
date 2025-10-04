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


# Additional serializers for approval system
class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with additional fields for approval system"""
    company_name = serializers.CharField(source='company.name', read_only=True)
    manager_name = serializers.CharField(source='manager.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'company', 'company_name', 'name', 'email', 'mobile_no', 
            'employee_id', 'department', 'role', 'manager', 'manager_name',
            'is_manager_approver', 'is_email_verified', 'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserPasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing user password"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password_strength])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class UserListSerializer(serializers.ModelSerializer):
    """Simplified serializer for user lists"""
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'employee_id', 'role', 
            'department', 'company_name', 'is_active', 'is_email_verified'
        ]