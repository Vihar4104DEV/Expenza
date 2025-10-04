import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables FIRST before importing configs
from expenza.config.load_env import *

# Now import configs that depend on environment variables
from expenza.config.celery_config import *
from expenza.config.cors_config import *
from expenza.config.database_config import *
from expenza.config.email_config import *
from expenza.config.logging_config import *
from expenza.config.rest_framwork_config import *
from expenza.config.storage_config import *

# Setup logging configuration
import logging.config
logging.config.dictConfig(LOGGING)

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-default-key-change-this-in-production-123456789")
IS_SECURE = os.environ.get('DJANGO_SECURE_MODE', 'False').lower() == 'true'
ALLOWED_HOSTS=os.environ.get('ALLOWED_HOSTS', '').split(',')
ENV = os.environ.get('ENV', 'development')
PERMISSION_BYPASS = True


#### APPS CONFIGURATION ####

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_celery_results',
    'django_celery_beat',
    'drf_spectacular',
    'adrf',
    'drf_api_logger',
    'background_task',
] 

LOCAL_APPS = [

]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS


#### MIDDLEWARE CONFIGURATION ####

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'drf_api_logger.middleware.api_logger_middleware.APILoggerMiddleware',
    'apps.core.middleware.APILoggingMiddleware',  # Custom API logging middleware
    'apps.core.middleware.error_tracking_middleware.EnhancedErrorTrackingMiddleware',  # Enhanced error tracking
]

# Additional middleware for ngrok compatibility
if not IS_SECURE:
    MIDDLEWARE.insert(0, 'django.middleware.common.CommonMiddleware')
    
ROOT_URLCONF = 'expenza.urls'

DRF_API_LOGGER_DATABASE = True

# Additional DRF API Logger Configuration
DRF_API_LOGGER_SIGNAL = False  # Disable signal-based logging to avoid duplicates
DRF_API_LOGGER_PATH_TYPE = 'ABSOLUTE'  # Log absolute paths
DRF_API_LOGGER_SLOW_API_ABOVE = 500  # Log APIs slower than 500ms
DRF_API_LOGGER_TIMEDELTA = 0  # No time delta for log retention
DRF_API_LOGGER_ENABLE_TRACING = True  # Enable request tracing
DRF_API_LOGGER_TRACING_ID_HEADER_NAME = 'X-Request-ID'  # Custom header for tracing
DRF_API_LOGGER_MAX_REQUEST_BODY_SIZE = 1000  # Max request body size to log (1KB)
DRF_API_LOGGER_EXCLUDE_KEYS = ['password', 'token', 'secret', 'key']  # Exclude sensitive data

# Enable verbose logging for development
if ENV == 'development':
    DRF_API_LOGGER_VERBOSE = True
    DRF_API_LOGGER_LOG_LEVEL = 'DEBUG'
    # Enable console logging for development
    DRF_API_LOGGER_CONSOLE_LOG = True
    # Log all methods
    DRF_API_LOGGER_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
    # Log all status codes
    DRF_API_LOGGER_STATUS_CODES = [200, 201, 202, 204, 300, 301, 302, 400, 401, 403, 404, 500, 502, 503]
    
    # Django debug settings for development
    DEBUG = True
    LOGGING_CONFIG = None  # Disable default logging config to use our custom one
else:
    DRF_API_LOGGER_VERBOSE = False
    DRF_API_LOGGER_LOG_LEVEL = 'INFO'
    DRF_API_LOGGER_CONSOLE_LOG = False
    DEBUG = False

### TEMPLATES CONFIGURATION ####
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / "templates",
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]




### AUTH CONFIGURATION ####
AUTH_USER_MODEL = "user.User"
AUTH_USER_ID_FIELD = "id"

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        "OPTIONS": {"min_length": 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

### Internationalization ###

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


### STATIC CONFIGURATION ####
STATIC_URL = 'static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static/')]
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = "/media/"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

#### CUSTOM CONFIGURATION ####

JWT_TOKEN_SECRET = os.environ.get('JWT_TOKEN_SECRET',None)
JWT_TOKEN_ISSUER = os.environ.get('JWT_TOKEN_ISSUER',None) 

#### TWILLIO CONFIGURATION ####
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID',None)
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN',None)
TWILIO_FROM_NUMBER = os.environ.get('TWILIO_FROM_NUMBER',None)

print(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)

##### ENCRYPTION CONFIGURATION ####
ENCRYPTION_PASSWORD = os.environ.get('ENCRYPTION_PASSWORD',None)
SALT_STR_KEY = os.environ.get('SALT_STR_KEY',None)

print(os.environ.get('NOTIFICATION_BYPASS', 'False').lower() == 'true')
##### NOTIFICATION CONFIGURATION ####
NOTIFICATION_BYPASS = os.environ.get('NOTIFICATION_BYPASS', 'False').lower() == 'true'


##### STRIPE CONFIGURATION #######
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY',None)
STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY',None)
STRIPE_SUBSCRIPTION_WEBHOOK_SECRET = os.environ.get('STRIPE_SUBSCRIPTION_WEBHOOK_SECRET',None)

UPDATE_SUCCESS_SUBSCRIPTION_URL = os.environ.get('UPDATE_SUCCESS_SUBSCRIPTION_URL',None)
SUCCESS_SUBSCRIPTION_URL = os.environ.get('SUCCESS_SUBSCRIPTION_URL',None)
UPDATE_CANCEL_SUBSCRIPTION_URL = os.environ.get('UPDATE_CANCEL_SUBSCRIPTION_URL',None)
CANCEL_SUBSCRIPTION_URL = os.environ.get('CANCEL_SUBSCRIPTION_URL',None)
FRONTEND_URL = os.environ.get('FRONTEND_URL',None)




DATA_UPLOAD_MAX_NUMBER_FILES=200
