import os

# =============================================================================
# CELERY CONFIGURATION
# =============================================================================
# Celery task queue configuration for background processing

CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_RETRY = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 5
CELERY_TIMEZONE = 'UTC'
CELERY_BROKER_CONNECTION_TIMEOUT = 600

# =============================================================================
# TASK QUEUES AND ROUTING CONFIGURATION
# =============================================================================
# Configure multiple queues with different priorities for optimal task handling

# Define task queues with priorities
CELERY_TASK_QUEUES = {
    'high_priority': {
        'exchange': 'high_priority',
        'exchange_type': 'direct',
        'routing_key': 'high_priority',
    },
    'normal_priority': {
        'exchange': 'normal_priority', 
        'exchange_type': 'direct',
        'routing_key': 'normal_priority',
    },
    'low_priority': {
        'exchange': 'low_priority',
        'exchange_type': 'direct', 
        'routing_key': 'low_priority',
    },
}

# Task routing - Route specific tasks to appropriate queues
CELERY_TASK_ROUTES = None
# Default queue for tasks not explicitly routed
CELERY_TASK_DEFAULT_QUEUE = 'normal_priority'
CELERY_TASK_DEFAULT_EXCHANGE = 'normal_priority'
CELERY_TASK_DEFAULT_ROUTING_KEY = 'normal_priority'

# Worker configuration for handling priorities
CELERY_WORKER_PREFETCH_MULTIPLIER = 1  # Process one task at a time for better priority handling
CELERY_TASK_ACKS_LATE = True  # Acknowledge tasks only after completion
CELERY_WORKER_DISABLE_RATE_LIMITS = False

# Redis-specific priority settings (Redis uses reverse priority: 0 = highest)
CELERY_REDIS_PRIORITY_STEPS = list(range(10))  # 0-9 priority levels
CELERY_TASK_INHERIT_PARENT_PRIORITY = True

# =============================================================================
# TASK EXECUTION SETTINGS
# =============================================================================

# Task time limits
CELERY_TASK_SOFT_TIME_LIMIT = 60 * 5   # 5 minutes soft limit
CELERY_TASK_TIME_LIMIT = 60 * 10       # 10 minutes hard limit

# OTP tasks should complete quickly
CELERY_TASK_ANNOTATIONS = None

# Celery beat settings
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

CELERY_BEAT_SCHEDULE = {
    
}