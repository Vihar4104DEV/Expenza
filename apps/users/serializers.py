from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from apps.users.models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    company_name = serializers.CharField(source='company.name', read_only=True)
    manager_name = serializers.CharField(source='manager.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'company', 'company_name', 'name', 'email', 'mobile_no', 
            'employee_id', 'department', 'role', 'manager', 'manager_name',
            'is_manager_approver', 'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating User"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'company', 'name', 'email', 'password', 'password_confirm',
            'mobile_no', 'employee_id', 'department', 'role', 'manager',
            'is_manager_approver'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating User"""
    
    class Meta:
        model = User
        fields = [
            'name', 'mobile_no', 'department', 'role', 'manager',
            'is_manager_approver'
        ]


class UserPasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing user password"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
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
            'department', 'company_name', 'is_active'
        ]
