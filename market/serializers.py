from rest_framework import serializers
from .models import MarketListing

class MarketListingSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    farmer_phone = serializers.CharField(source='farmer.phone_number', read_only=True)
    farmer_region = serializers.CharField(source='farmer.region', read_only=True)
    farmer_district = serializers.CharField(source='farmer.district', read_only=True)

    class Meta:
        model = MarketListing
        fields = '__all__'
