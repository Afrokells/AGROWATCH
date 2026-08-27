from rest_framework import serializers
from .models import Scan, Detection

class DetectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Detection
        fields = '__all__'

class ScanSerializer(serializers.ModelSerializer):
    detections = DetectionSerializer(many=True, read_only=True)
    farm_name = serializers.CharField(source='farm.farm_name', read_only=True)

    class Meta:
        model = Scan
        fields = '__all__'
