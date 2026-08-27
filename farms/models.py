from django.db import models
from django.conf import settings

class Farm(models.Model):
    CROP_CHOICES = (
        ('tomato', 'Tomato'),
        ('maize', 'Maize'),
        ('pineapple', 'Pineapple'),
    )

    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='farms')
    farm_name = models.CharField(max_length=255)
    crop_type = models.CharField(max_length=50, choices=CROP_CHOICES)
    region = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    area_ha = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.farm_name
