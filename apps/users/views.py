from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import serializers

from apps.core.utils.response_wrapper import api_response
from apps.core.utils.exceptions import extract_first_error_message
from apps.users.services import (
    create_user,
    update_user,
    delete_user,
    set_user_active,
    list_users,
    get_user_by_id,
    build_user_payload,
    build_user_list_payload,
    get_user_detail_payload,
)
from .serializers import (
    UserCreateSerializer,
    UserUpdateSerializer,
    UserDetailSerializer,
)

User = get_user_model()


def _is_admin(user: User) -> bool:
    return getattr(user, 'role', None) == 'Admin'


class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to view users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            # Get query parameters for pagination, filtering, and search
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            department = request.query_params.get('department', None)
            role = request.query_params.get('role', None)
            search = request.query_params.get('search', None)
            is_active = request.query_params.get('is_active', None)
            
            # Get filtered and paginated users
            result = list_users(
                company=request.user.company,
                page=page,
                page_size=page_size,
                department=department,
                role=role,
                search=search,
                is_active=is_active
            )
            
            return api_response(data=result, message="Users retrieved successfully")
        except ValueError as e:
            return api_response(message="Invalid pagination parameters", status_code=status.HTTP_400_BAD_REQUEST, success=False)
        except Exception as e:
            print(f"Error retrieving users: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to retrieve users", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)

    def post(self, request):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to create users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            serializer = UserCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            payload = serializer.validated_data
            
            manager = None
            manager_id = payload.get('manager_id')
            if manager_id:
                try:
                    manager = User.objects.get(id=manager_id, company=request.user.company)
                except User.DoesNotExist:
                    return api_response(message="Manager not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            user = create_user(
                company=request.user.company,
                name=payload['name'],
                email=payload['email'],
                role=payload['role'],
                password=payload.get('password'),
                manager=manager,
                department=payload.get('department')
            )
            return api_response(data=build_user_payload(user), message="User created successfully", status_code=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            error_message = extract_first_error_message(e.detail)
            return api_response(data=None, message=error_message, status_code=status.HTTP_400_BAD_REQUEST, success=False)
        except Exception as e:
            if hasattr(e, 'detail'):
                error_message = extract_first_error_message(e.detail)
                return api_response(data=None, message=error_message, status_code=status.HTTP_400_BAD_REQUEST, success=False)
            print(f"Error creating user: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to create user", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to view user details", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            try:
                user = User.objects.select_related('company', 'manager').get(id=user_id, company=request.user.company)
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            # Return detailed user information
            data = get_user_detail_payload(user)
            return api_response(data=data, message="User details retrieved successfully")
        except Exception as e:
            print(f"Error retrieving user details: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to retrieve user details", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)

    def patch(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to update users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            try:
                target = User.objects.get(id=user_id, company=request.user.company)
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            serializer = UserUpdateSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            
            # Resolve manager if provided
            if 'manager_id' in data:
                manager_id = data.pop('manager_id')
                if manager_id:
                    try:
                        data['manager'] = User.objects.get(id=manager_id, company=request.user.company)
                    except User.DoesNotExist:
                        return api_response(message="Manager not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
                else:
                    data['manager'] = None
            
            updated = update_user(target, **data)
            return api_response(data=build_user_payload(updated), message="User updated successfully")
        except serializers.ValidationError as e:
            error_message = extract_first_error_message(e.detail)
            return api_response(data=None, message=error_message, status_code=status.HTTP_400_BAD_REQUEST, success=False)
        except Exception as e:
            if hasattr(e, 'detail'):
                error_message = extract_first_error_message(e.detail)
                return api_response(data=None, message=error_message, status_code=status.HTTP_400_BAD_REQUEST, success=False)
            print(f"Error updating user: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to update user", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)

    def delete(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to delete users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            try:
                target = User.objects.get(id=user_id, company=request.user.company)
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            # Soft delete via model's delete()
            target.delete()
            return api_response(message="User deleted successfully", status_code=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error deleting user: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to delete user", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)


class UserActivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to activate users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            try:
                target = User.objects.get(id=user_id, company=request.user.company)
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            set_user_active(target, True)
            return api_response(message="User activated successfully")
        except Exception as e:
            print(f"Error activating user: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to activate user", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)


class UserDeactivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="You do not have permission to deactivate users", status_code=status.HTTP_403_FORBIDDEN, success=False)
            
            try:
                target = User.objects.get(id=user_id, company=request.user.company)
            except User.DoesNotExist:
                return api_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND, success=False)
            
            set_user_active(target, False)
            return api_response(message="User deactivated successfully")
        except Exception as e:
            print(f"Error deactivating user: {str(e)}")
            return api_response(message=str(e) if str(e) else "Failed to deactivate user", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, success=False)
