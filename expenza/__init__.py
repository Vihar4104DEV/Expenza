# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
import os
import sys

# Add the parent directory to Python path to import celery_app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from celery_app import app as celery_app
    __all__ = ('celery_app',)
except ImportError:
    # If celery_app is not available, continue without it
    pass
