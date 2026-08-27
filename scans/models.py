from django.db import models
from farms.models import Farm

class Scan(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='scans')
    crop_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_plants = models.IntegerField(default=0)
    disease_flags = models.IntegerField(default=0)
    
    precision = models.FloatField(null=True, blank=True)
    recall = models.FloatField(null=True, blank=True)
    f1_score = models.FloatField(null=True, blank=True)
    mota = models.FloatField(null=True, blank=True)
    identity_switches = models.IntegerField(default=0)
    
    image_count = models.IntegerField(default=0)
    image = models.ImageField(upload_to='scans/', null=True, blank=True)
    scan_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Scan {self.id} on {self.farm.farm_name}"

class Detection(models.Model):
    scan = models.ForeignKey(Scan, on_delete=models.CASCADE, related_name='detections')
    track_id = models.IntegerField()
    confidence = models.FloatField()
    x = models.FloatField()
    y = models.FloatField()
    w = models.FloatField()
    h = models.FloatField()
    disease_flag_id = models.CharField(max_length=100)

    def __str__(self):
        return f"Detection {self.track_id} - {self.disease_flag_id}"
