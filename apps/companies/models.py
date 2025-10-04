from django.db import models

from apps.core.models import BaseModel


class Company(BaseModel):
    """Company created automatically on first signup.

    Why:
    - Central tenant entity. Holds organization-wide defaults like currency/country.
    - Independent of user lifecycle. Multiple users can belong to one company.

    Denotes:
    - A legal/business entity using the system.
    """
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    default_currency = models.CharField(max_length=10)  # e.g., USD, INR

    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'Companies'

    def __str__(self) -> str:
        return f"{self.name} ({self.default_currency})"
