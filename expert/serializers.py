from rest_framework import serializers
from .models import DiseaseCondition

class DiseaseConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseCondition
        fields = '__all__'
