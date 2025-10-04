import os
import logging.config

environment = os.environ.get("ENV", "development")

# Default logging configuration
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{levelname}] {asctime} {name}:{lineno} {message}",
            "style": "{",
        },
        "simple": {
            "format": "[{levelname}] {message}",
            "style": "{",
        },
        "api_logger": {
            "format": "[API LOGGER] {asctime} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose" if environment == "production" else "simple",
        },
        "api_console": {
            "class": "logging.StreamHandler",
            "formatter": "api_logger",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO" if environment == "development" else "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO" if environment == "development" else "WARNING",
            "propagate": True,
        },
        "drf_api_logger": {
            "handlers": ["console", "api_console"],
            "level": "INFO",
            "propagate": False,
        },
        "api_console": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console"],
            "level": "INFO" if environment == "development" else "INFO",
            "propagate": False,
        },
        "django.db.backends": {
            "handlers": ["console"],
            "level": "INFO" if environment == "development" else "WARNING",
            "propagate": False,
        },
    },
}
