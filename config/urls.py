from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from users.views import UserViewSet, LoginView, RegisterView
from farms.views import FarmViewSet
from market.views import MarketListingViewSet
from scans.views import ScanViewSet, DetectionViewSet
from expert.views import DiseaseConditionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'farms', FarmViewSet, basename='farm')
router.register(r'market/listings', MarketListingViewSet, basename='marketlisting')
router.register(r'scans', ScanViewSet, basename='scan')
router.register(r'detections', DetectionViewSet, basename='detection')
router.register(r'expert/conditions', DiseaseConditionViewSet, basename='diseasecondition')

from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def root_health_check(request):
    return JsonResponse({
        'status': 'online',
        'service': 'AgroWatch AI Backend API',
        'version': '1.0.0'
    })

urlpatterns = [
    path('', root_health_check, name='root_health_check'),
    path('admin/', admin.site.urls),
    path('api/auth/login/', LoginView.as_view(), name='api_login'),
    path('api/auth/register/', RegisterView.as_view(), name='api_register'),
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include(router.urls)),
    path('api/messages/', include('messaging.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

