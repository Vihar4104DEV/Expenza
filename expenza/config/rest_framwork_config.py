# =============================================================================
#### REST FRAMWORK CONFIGURATIONS ####
# =============================================================================


from datetime import timedelta
import os


REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "EXCEPTION_HANDLER": "apps.core.utils.exceptions.custom_exception_handler",
    'DEFAULT_PAGINATION_CLASS': 'apps.core.utils.paginations.CustomPagePagination',
    "PAGE_SIZE": 10,
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "user": "3600/d",
        "anon": "2000/d",
        
    },
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=60),  # No expiration for access tokens
    'REFRESH_TOKEN_LIFETIME': timedelta(days=36500),  # No expiration for refresh tokens
    'ROTATE_REFRESH_TOKENS': False,  # Prevent rotation if you want a single persistent token
    'BLACKLIST_AFTER_ROTATION': True,  # Prevent old refresh tokens from being blacklisted
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': os.environ.get('SECRET_KEY'),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'VERIFY_EXP': False,
    'USER_ID_FIELD': 'id',  # Fixed: Use 'id' instead of 'user_id' to match User model
}

# DRF Spectacular Settings for API Documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'RexArchitect API',
    'DESCRIPTION': 'API documentation for RexArchitect project - A comprehensive Django REST API for enterprise management',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': False,
    },
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
}

