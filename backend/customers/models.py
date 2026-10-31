from django.conf import settings
from django.db import models


class Customer(models.Model):
    """Billing profile; account/authentication remains owned by the accounts module."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name='customer_profile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=40, blank=True)
    billing_address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name', 'id']

    def __str__(self):
        return self.company or self.name
