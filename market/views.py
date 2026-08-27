from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MarketListing
from .serializers import MarketListingSerializer

class MarketListingViewSet(viewsets.ModelViewSet):
    serializer_class = MarketListingSerializer

    def get_queryset(self):
        queryset = MarketListing.objects.all().order_by('-created_at')
        user = self.request.user
        role = getattr(user, 'user_role', None) or getattr(user, 'role', None)
        if user.is_authenticated and role == 'farmer':
            queryset = queryset.filter(farmer=user)

        crop_type = self.request.query_params.get('crop_type')
        region = self.request.query_params.get('region')
        if crop_type:
            queryset = queryset.filter(crop_type=crop_type)
        if region:
            queryset = queryset.filter(farmer__region=region)
        return queryset

    @action(detail=True, methods=['post'])
    def enquire(self, request, pk=None):
        return Response({'success': True, 'message': 'Enquiry received'}, status=status.HTTP_200_OK)
