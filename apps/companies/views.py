from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.companies.models import Company
from apps.companies.serializers import (
    CompanySerializer, CompanyCreateSerializer, CompanyUpdateSerializer
)
from apps.companies.services import CompanyService
from apps.core.utils.response_wrapper import api_response


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
        """Return all companies instead of filtering by user"""
        return Company.objects.all()
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            data=serializer.data,
            message="Companies retrieved successfully"
        )

    def retrieve(self, request, *args, **kwargs):
        company = self.get_object()
        serializer = self.get_serializer(company)
        return api_response(
            data=serializer.data,
            message="Company details retrieved successfully"
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return api_response(
            data=serializer.data,
            message="Company created successfully",
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return api_response(
            data=serializer.data,
            message="Company updated successfully"
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return api_response(
            data={},
            message="Company deleted successfully"
        )

    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """Get all users for a company"""
        company = self.get_object()
        role = request.query_params.get('role')
        users = CompanyService.get_company_users(company.id, role)

        from apps.users.serializers import UserListSerializer
        serializer = UserListSerializer(users, many=True)
        return api_response(
            data=serializer.data,
            message="Company users retrieved successfully"
        )
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get company statistics"""
        company = self.get_object()
        stats = CompanyService.get_company_statistics(company.id)
        return api_response(
            data=stats,
            message="Company statistics retrieved successfully"
        )
    
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
            
            return api_response(
                data={
                    'company': company_serializer.data,
                    'admin': admin_serializer.data
                },
                message="Company with admin created successfully",
                status_code=status.HTTP_201_CREATED
            )
        except Exception as e:
            return api_response(
                data={},
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )
