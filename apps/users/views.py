from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import serializers

from apps.core.utils.response_wrapper import api_response
from apps.users.services import (
    create_user,
    update_user,
    delete_user,
    set_user_active,
    list_users,
    get_user_by_id,
    build_user_payload,
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
                return api_response(message="Forbidden", status_code=403)
            users = list_users(request.user.company)
            data = [build_user_payload(u) for u in users]
            return api_response(data=data)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)

    def post(self, request):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            serializer = UserCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            payload = serializer.validated_data
            manager = None
            manager_id = payload.get('manager_id')
            if manager_id:
                manager = get_object_or_404(User, id=manager_id, company=request.user.company)
            user = create_user(
                company=request.user.company,
                name=payload['name'],
                email=payload['email'],
                employee_id=payload['employee_id'],
                role=payload['role'],
                password=payload.get('password'),
                manager=manager,
            )
            return api_response(data=build_user_payload(user), message="User created", status_code=201)
        except serializers.ValidationError as e:
            return api_response(message="Validation Error", error=e.detail, status_code=400)
        except Http404:
            return api_response(message="Manager not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            user = get_object_or_404(User, id=user_id, company=request.user.company)
            return api_response(data=build_user_payload(user))
        except Http404:
            return api_response(message="User not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)

    def patch(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            target = get_object_or_404(User, id=user_id, company=request.user.company)
            serializer = UserUpdateSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            # Resolve manager if provided
            if 'manager_id' in data:
                manager_id = data.pop('manager_id')
                data['manager'] = get_object_or_404(User, id=manager_id, company=request.user.company) if manager_id else None
            updated = update_user(target, **data)
            return api_response(data=build_user_payload(updated), message="User updated")
        except serializers.ValidationError as e:
            return api_response(message="Validation Error", error=e.detail, status_code=400)
        except Http404:
            return api_response(message="User or Manager not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)

    def delete(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            target = get_object_or_404(User, id=user_id, company=request.user.company)
            # Soft delete via model's delete()
            target.delete()
            return api_response(message="User deleted (soft)", status_code=204)
        except Http404:
            return api_response(message="User not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


class UserActivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            target = get_object_or_404(User, id=user_id, company=request.user.company)
            set_user_active(target, True)
            return api_response(message="User activated")
        except Http404:
            return api_response(message="User not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)


class UserDeactivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            if not _is_admin(request.user):
                return api_response(message="Forbidden", status_code=403)
            target = get_object_or_404(User, id=user_id, company=request.user.company)
            set_user_active(target, False)
            return api_response(message="User deactivated")
        except Http404:
            return api_response(message="User not found", status_code=404)
        except Exception as e:
            return api_response(message="An unexpected error occurred", error=str(e), status_code=500)