from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UserListCreateView,
    UserDetailView,
    UserActivateView,
    UserDeactivateView,
    UserViewSet,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', UserListCreateView.as_view(), name='user-list-create'),
    path('<uuid:user_id>/', UserDetailView.as_view(), name='user-detail'),
    path('<uuid:user_id>/activate/', UserActivateView.as_view(), name='user-activate'),
    path('<uuid:user_id>/deactivate/', UserDeactivateView.as_view(), name='user-deactivate'),
    path('', include(router.urls)),
]
