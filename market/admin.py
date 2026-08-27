from django.contrib import admin
from .models import MarketListing

@admin.register(MarketListing)
class MarketListingAdmin(admin.ModelAdmin):
    list_display = ('crop_type', 'farmer', 'quantity_kg', 'asking_price_ghs', 'listing_status', 'created_at')
    list_filter = ('crop_type', 'listing_status')
    search_fields = ('farmer__full_name', 'farmer__phone_number', 'crop_type')
