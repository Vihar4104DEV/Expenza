from django.core.exceptions import ValidationError
from django.core.validators import validate_email


def validate_email_address(value: str) -> str:
    """Validate email using Django's validator and return normalized value.
    Raises ValidationError if invalid.
    """
    validate_email(value)
    return value.strip().lower()


def validate_password_strength(password: str) -> None:
    """Basic password strength validation.
    Extend to use Django's built-in password validators if needed.
    """
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
