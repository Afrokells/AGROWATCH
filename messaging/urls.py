from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatThreadViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'threads', ChatThreadViewSet, basename='thread')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
