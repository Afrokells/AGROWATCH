from django.db import models
from django.conf import settings

class MarketListing(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('inactive', 'Inactive'),
    )

    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    crop_type = models.CharField(max_length=50)
    quantity_kg = models.FloatField()
    asking_price_ghs = models.DecimalField(max_digits=10, decimal_places=2)
    harvest_date = models.DateField()
    listing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_type} by {self.farmer.full_name or self.farmer.phone_number}"
