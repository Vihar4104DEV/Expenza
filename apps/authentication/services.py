import random
from datetime import timedelta
from typing import Optional, Tuple

from django.conf import settings
from django.utils import timezone
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.validators import validate_email_address
from .models import OTP


def _generate_otp_code() -> str:
    """Generate a 6-digit OTP code as a string."""
    return f"{random.randint(100000, 999999)}"


def issue_otp(email: str, purpose: str, ttl_minutes: int = 10) -> OTP:
    """Create and return an OTP for the given email and purpose.

    - Invalidates nothing automatically; callers should treat latest non-used OTP as valid.
    - Expiry defaults to 10 minutes.
    """
    email = validate_email_address(email)
    code = _generate_otp_code()
    expires_at = timezone.now() + timedelta(minutes=ttl_minutes)
    otp = OTP.objects.create(email=email, code=code, purpose=purpose, expires_at=expires_at)
    return otp


def verify_otp(email: str, purpose: str, code: str) -> bool:
    """Verify if the provided OTP is valid and mark it as used.

    Returns True if valid, otherwise False.
    """
    email = validate_email_address(email)
    otp = (
        OTP.objects.filter(email=email, purpose=purpose, code=code, is_active=True, is_used=False)
        .order_by('-created_at')
        .first()
    )
    if not otp:
        return False
    if otp.is_expired:
        return False
    otp.is_used = True
    otp.save(update_fields=["is_used", "updated_at"])
    return True


def issue_tokens_for_user(user) -> dict:
    """Issue JWT access and refresh tokens for a user."""
    print("before generating tokens")
    refresh = RefreshToken.for_user(user)
    print("refresh",refresh)
    print("after generating tokens")
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def authenticate_user(email: str, password: str):
    """Authenticate user using Django's auth system."""
    email = email.strip().lower()
    user = authenticate(username=email, password=password)
    return user

