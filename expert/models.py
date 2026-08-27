from django.db import models

class DiseaseCondition(models.Model):
    SEVERITY_CHOICES = (
        ('none', 'None'),
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    crop_type = models.CharField(max_length=50)
    condition_id = models.CharField(max_length=100, unique=True)
    label = models.CharField(max_length=255)
    pathogen = models.CharField(max_length=255, blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='none')
    description = models.TextField()
    recommendation = models.TextField()

    def __str__(self):
        return f"{self.crop_type.title()} - {self.label}"
