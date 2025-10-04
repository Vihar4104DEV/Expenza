# Core models will be added here when needed
# For now, keeping this file empty to avoid model conflicts

from django.db import models
import uuid

class BaseModel(models.Model):
    """Abstract base model shared by all domain models.

    Why:
    - Use UUIDs for safer merges, replication, and external references.
    - Track ``created_at`` and ``updated_at`` for auditing and ordering.
    - ``is_active`` enables soft-deactivation without destructive deletes.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True
