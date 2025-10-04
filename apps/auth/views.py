from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from apps.users.models import User
from apps.users.serializers import UserSerializer
from apps.users.services import UserService


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login endpoint"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    auth_result = UserService.authenticate_user(email, password)
    
    if auth_result:
        user_serializer = UserSerializer(auth_result['user'])
        return Response({
            'user': user_serializer.data,
            'tokens': auth_result['tokens']
        })
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint"""
    user_data = request.data
    
    # Validate required fields
    required_fields = ['name', 'email', 'password', 'password_confirm', 'employee_id']
    for field in required_fields:
        if not user_data.get(field):
            return Response(
                {'error': f'{field} is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    if user_data['password'] != user_data['password_confirm']:
        return Response(
            {'error': 'Passwords do not match'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already exists
    if User.objects.filter(email=user_data['email']).exists():
        return Response(
            {'error': 'User with this email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Create user
        user_data.pop('password_confirm')
        user = UserService.create_user(user_data)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }
        
        user_serializer = UserSerializer(user)
        return Response({
            'user': user_serializer.data,
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh JWT token"""
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response(
            {'error': 'Refresh token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        new_access_token = str(refresh.access_token)
        
        return Response({
            'access': new_access_token
        })
    except Exception as e:
        return Response(
            {'error': 'Invalid refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """User logout endpoint"""
    refresh_token = request.data.get('refresh')
    
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass  # Token might already be blacklisted
    
    return Response({'message': 'Logged out successfully'})
