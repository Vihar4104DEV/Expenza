#===========================================================
# EMAIL CONFIGURATION
#===========================================================
import os

# Get environment
ENV = os.environ.get('ENV', 'development')

# Email backend configuration
if ENV in ['development', 'local']:
    # Use console backend for development if no SMTP settings are provided
    if not os.environ.get('EMAIL_HOST'):
        EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
        print("Using console email backend for development")
    else:
        EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# SMTP Configuration
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'localhost')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@askrex.com.au')

# Development settings
SEND_EMAILS_IN_DEV = os.environ.get('SEND_EMAILS_IN_DEV', 'False').lower() == 'true'