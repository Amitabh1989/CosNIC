from django.urls import include, path
from rest_framework import routers
from .views import ConfigurationView, EmailOptionsView, DownloadConfigFile

# from tutorial.quickstart import views

router = routers.DefaultRouter()
router.register(r"configfile", ConfigurationView, "configfile")
router.register(r"emailoptions", EmailOptionsView, "emailoptions")
# router.register(r'users', views.UserViewSet)
# router.register(r'groups', views.GroupViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path("", include(router.urls)),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path('download/<int:pk>/', DownloadConfigFile.as_view(), name='config-download'),
]
