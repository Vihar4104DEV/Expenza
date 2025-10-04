# Core models will be added here when needed
# For now, keeping this file empty to avoid model conflicts

from django.db import models
import uuid
from django.utils import timezone

class SoftDeleteQuerySet(models.QuerySet):
    """QuerySet supporting soft delete operations."""

    def delete(self):
        return super().update(deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()

    def alive(self):
        return self.filter(deleted_at__isnull=True)

    def dead(self):
        return self.exclude(deleted_at__isnull=True)


class SoftDeleteManager(models.Manager):
    """Default manager that hides soft-deleted rows."""

    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).filter(deleted_at__isnull=True)


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
    deleted_at = models.DateTimeField(null=True, blank=True)

    # Managers
    objects = SoftDeleteManager()
    all_objects = SoftDeleteQuerySet.as_manager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        """Soft delete: mark row as deleted instead of removing it."""
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at", "updated_at"])

    def hard_delete(self, using=None, keep_parents=False):
        """Irreversibly delete the row from the database."""
        return super().delete(using=using, keep_parents=keep_parents)
