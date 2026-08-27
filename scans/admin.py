from django.contrib import admin
from .models import Scan, Detection

class DetectionInline(admin.TabularInline):
    model = Detection
    extra = 0

@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ('id', 'farm', 'crop_type', 'status', 'total_plants', 'disease_flags', 'scan_date')
    list_filter = ('status', 'crop_type')
    search_fields = ('farm__farm_name',)
    inlines = [DetectionInline]

@admin.register(Detection)
class DetectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'scan', 'track_id', 'disease_flag_id', 'confidence')
    list_filter = ('disease_flag_id',)
