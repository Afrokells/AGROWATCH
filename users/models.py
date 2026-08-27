from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('farmer', 'Farmer'),
        ('buyer', 'Buyer'),
        ('expert', 'Expert'),
        ('admin', 'Admin'),
    )
    
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, unique=True)
    user_role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='farmer')
    region = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['username', 'full_name']

    def __str__(self):
        return self.full_name or self.phone_number
