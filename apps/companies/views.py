from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.companies.models import Company
from apps.companies.serializers import (
    CompanySerializer, CompanyCreateSerializer, CompanyUpdateSerializer
)
from apps.companies.services import CompanyService


class CompanyViewSet(viewsets.ModelViewSet):
    """ViewSet for Company model"""
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['country', 'default_currency', 'is_active']
    search_fields = ['name', 'country']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CompanyCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CompanyUpdateSerializer
        return CompanySerializer
    
    def get_queryset(self):
        """Filter companies based on user's company"""
        if self.request.user.is_authenticated:
            return Company.objects.filter(id=self.request.user.company.id)
        return Company.objects.none()
    
    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """Get all users for a company"""
        company = self.get_object()
        role = request.query_params.get('role')
        users = CompanyService.get_company_users(company.id, role)
        
        from apps.users.serializers import UserListSerializer
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get company statistics"""
        company = self.get_object()
        stats = CompanyService.get_company_statistics(company.id)
        return Response(stats)
    
    @action(detail=False, methods=['post'])
    def create_with_admin(self, request):
        """Create a company with its first admin user"""
        company_data = request.data.get('company', {})
        admin_data = request.data.get('admin', {})
        
        try:
            company, admin = CompanyService.create_company_with_admin(company_data, admin_data)
            
            company_serializer = CompanySerializer(company)
            from apps.users.serializers import UserSerializer
            admin_serializer = UserSerializer(admin)
            
            return Response({
                'company': company_serializer.data,
                'admin': admin_serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
