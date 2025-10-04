### DATABASE CONFIGURATION ####

import os

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PWD"),
        "HOST": os.environ.get("DB_HOST"),
        "PORT": os.environ.get("DB_PORT"),
        'OPTIONS': {
            'sslmode': os.environ.get('DB_SSL_MODE'),
            'gssencmode': 'disable',
        },
        
    }
}





