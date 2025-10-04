"""
Custom exception handler for DRF (Django Rest Framework).

This module provides a custom exception handler for DRF that modifies the default behavior.
It returns the first error in the message and all errors in the errors list. This handler
is useful for making error responses more readable and informative for the client.

The custom handler formats field-specific errors and non-field-specific errors, and returns
a standardized JSON response.
"""

from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.exceptions import (
    ValidationError,
    NotAuthenticated,
    PermissionDenied,
    AuthenticationFailed,
    NotFound,
    MethodNotAllowed,
    NotAcceptable,
    UnsupportedMediaType,
    Throttled,
    ParseError,
    APIException,
)
from django.core.exceptions import ValidationError as DjangoValidationError
import logging
from apps.core.utils.response_wrapper import api_response

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Global exception handler for Django REST Framework.
    Provides consistent, human-friendly JSON responses.
    """

    # Call DRF's default handler
    response = exception_handler(exc, context)

    # --- Validation Errors ---
    if isinstance(exc, ValidationError):
        message = extract_first_error_message(exc.detail)
        return api_response(
            data=None,
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error=str(exc),
            success=False,
        )

    if isinstance(exc, DjangoValidationError):
        message = str(exc.message)
        return api_response(
            data=None,
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error=str(exc),
            success=False,
        )

    # --- Authentication / Permission Errors ---
    if isinstance(exc, NotAuthenticated):
        return api_response(
            data=None,
            message="Authentication required. Please log in.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            error=str(exc),
            success=False,
        )

    if isinstance(exc, AuthenticationFailed):
        return api_response(
            data=None,
            message="Invalid credentials. Please check your login details.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            error=str(exc),
            success=False,
        )

    if isinstance(exc, PermissionDenied):
        
        return api_response(
            data=None,
            message=str(exc),
            status_code=status.HTTP_403_FORBIDDEN,
            error=str(exc),
            success=False,
        )

    # --- Request & Method Errors ---
    if isinstance(exc, ParseError):
        return api_response(
            data=None,
            message="Malformed request. Please check your input.",
            status_code=status.HTTP_400_BAD_REQUEST,
            error=str(exc),
            success=False,
        )

    if isinstance(exc, MethodNotAllowed):
        logger.error(f"Method not allowed on this endpoint.", str(exc))

        import re
        match = re.search(r'"(POST|GET|PUT|DELETE|PATCH)"', str(exc))
        if match:
            method = match.group(1)
        else:
            method = None

        return api_response(
            data=None,
            message=f"Method {method} not allowed on this endpoint.",
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            error=str(exc),
            success=False,
        )

    if isinstance(exc, NotAcceptable):
        return api_response(
            data=None,
            message="Requested content type is not acceptable.",
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            error=str(exc),
            success=False,
        )

    if isinstance(exc, UnsupportedMediaType):
        return api_response(
            data=None,
            message=f"Unsupported media type '{exc.media_type}'.",
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            error=str(exc),
            success=False,
        )

    # --- Not Found ---
    if isinstance(exc, NotFound):
        return api_response(
            data=None,
            message="The requested resource was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            error=str(exc),
            success=False,
        )

    # --- Throttling ---
    if isinstance(exc, Throttled):
        return api_response(
            data=None,
            message=f"Request was throttled. Try again in {exc.wait} seconds.",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error=str(exc),
            success=False,
        )

    # --- KeyError (commonly from throttle rate parsing) ---
    if isinstance(exc, KeyError):
        logger.error(f"KeyError occurred: {str(exc)}", exc_info=exc)
        return api_response(
            data=None,
            message="Configuration error. Please contact support.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=str(exc),
            success=False,
        )

    # --- License Restricted Exception ---
    if isinstance(exc, LicenseRestrictedException):
        return api_response(
            data=None,
            message=exc.detail,
            status_code=exc.status_code,
            error=str(exc),
            success=False,
        )

    # --- License Resubmission Exception ---
    if isinstance(exc, LicenseResubmissionException):
        return api_response(
            data=None,
            message=exc.detail,
            status_code=exc.status_code,
            error=str(exc),
            success=False,
        )

    # --- Logout Exception ---
    if isinstance(exc, LogoutException):
        return api_response(
            data=None,
            message=exc.default_detail,
            status_code=exc.status_code,
            error=str(exc),
            success=False,
        )

    # --- Exception ---
    if isinstance(exc, Exception):
        return api_response(
            data=None,
            message=str(exc),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=str(exc),
            success=False,
        )
    # --- If DRF already generated a response ---
    if response is not None:
        message = (
            response.data if isinstance(response.data, str) else str(response.data)
        )
        return api_response(
            data=None,
            message=message,
            status_code=response.status_code,
            error=str(exc),
            success=False,
        )

    # --- Unexpected Errors (safe for production) ---
    logger.error("Unhandled exception", exc_info=exc)
    return api_response(
        data=None,
        message="Something went wrong. Please try again later.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error=str(exc),  # logged internally but generic for client
        success=False,
    )


def extract_first_error_message(errors, field_name=None):
    """
    Recursively extract the first error message from nested validation errors,
    formatting them in a human-friendly way.
    """
    if isinstance(errors, list):
        message = str(errors[0]).strip()
        if field_name:
            field_label = field_name.replace("_", " ").capitalize()
            if "This field" in message:
                message = message.replace("This field", field_label)
            return message
        return message

    if isinstance(errors, dict):
        first_key = next(iter(errors))
        if first_key == "non_field_errors":
            return extract_first_error_message(errors[first_key])
        return extract_first_error_message(errors[first_key], field_name=first_key)

    return str(errors).strip()


class LicenseRestrictedException(APIException):
    """ 
    Exception for license restricted.
    This exception is raised when a user's license is rejected.

    Attributes:
        status_code (430): The HTTP status code for the exception.
        default_detail (str): The default detail message for the exception.
        default_code (str): The default code for the exception.

    Methods:
        __init__(self, detail=None): Initializes the exception with a detail message.
        
    """
    
    status_code = 430
    default_detail = "Your license has been rejected. Please resubmit the license."
    default_code = "license_rejected"

    def __init__(self, detail=None):
        print("detail", detail)
        self.detail = detail if detail else self.default_detail
        
        super().__init__(self.detail)
        
        

class LicenseResubmissionException(APIException):
    """ 
    Exception for license resubmission.
    This exception is raised when a user's license is resubmitted.

    Attributes:
        status_code (460): The HTTP status code for the exception.
        default_detail (str): The default detail message for the exception.
        default_code (str): The default code for the exception.
    """
    status_code = 460
    default_detail = "Your license has been resubmitted and is under review."
    default_code = "license_resubmitted"

    def __init__(self, detail=None):
        print("detail", detail)
        self.detail = detail if detail else self.default_detail
        
        super().__init__(self.detail)
        

class LogoutException(APIException):
    status_code = 440  
    default_detail = "You're Already Logged In on Another Device"
    default_code = "Device_logout"
    