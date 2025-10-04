from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel


class OTP(BaseModel):
    """One-Time Password entity for email verification and password reset.

    Denotes:
    - A single-use code tied to an email and purpose, with expiry and usage flags.

    Why:
    - Centralizes OTP issuance/verification for multiple flows (signup verification, password reset).
    - Tracks expiration and consumption for security.
    """

    PURPOSE_CHOICES = [
        ("email_verification", "Email Verification"),
        ("password_reset", "Password Reset"),
    ]

    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=32, choices=PURPOSE_CHOICES)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'otp_table'
        indexes = [
            models.Index(fields=["email", "purpose", "is_used"]),
        ]

    def __str__(self) -> str:
        return f"OTP<{self.purpose}> for {self.email}"

    @property
    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at

