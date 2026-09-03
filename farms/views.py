from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Farm
from .serializers import FarmSerializer

class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            role = getattr(user, 'user_role', None) or getattr(user, 'role', None)
            if role == 'admin' or user.is_staff or user.is_superuser:
                return Farm.objects.all().order_by('-created_at')
            return Farm.objects.filter(farmer=user).order_by('-created_at')
        return Farm.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        farmer_user = self.request.user if self.request.user.is_authenticated else None
        if not farmer_user:
            from users.models import User
            farmer_user = User.objects.filter(user_role='farmer').first() or User.objects.first()
        serializer.save(farmer=farmer_user)
