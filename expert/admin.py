from django.contrib import admin
from .models import DiseaseCondition

@admin.register(DiseaseCondition)
class DiseaseConditionAdmin(admin.ModelAdmin):
    list_display = ('condition_id', 'crop_type', 'label', 'severity')
    list_filter = ('crop_type', 'severity')
    search_fields = ('condition_id', 'label', 'pathogen')
