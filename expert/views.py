from rest_framework import viewsets
from .models import DiseaseCondition
from .serializers import DiseaseConditionSerializer

class DiseaseConditionViewSet(viewsets.ModelViewSet):
    queryset = DiseaseCondition.objects.all()
    serializer_class = DiseaseConditionSerializer
    lookup_field = 'condition_id'
