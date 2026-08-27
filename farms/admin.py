from django.contrib import admin
from .models import Farm

@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('farm_name', 'farmer', 'crop_type', 'region', 'area_ha', 'created_at')
    list_filter = ('crop_type', 'region')
    search_fields = ('farm_name', 'farmer__username', 'farmer__full_name')
