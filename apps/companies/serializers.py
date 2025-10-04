from rest_framework import serializers
from apps.companies.models import Company


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model"""
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'country', 'default_currency', 
            'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompanyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Company"""
    
    class Meta:
        model = Company
        fields = ['name', 'country', 'default_currency']


class CompanyUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Company"""
    
    class Meta:
        model = Company
        fields = ['name', 'country', 'default_currency']
