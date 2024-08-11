from django.shortcuts import render
from .models import (
    SITVersionModel,
    SITModel,
    STATModel,
    # TestSuiteModel,
    TestSuitesPathModel,
    SUTClientConfigModel,
    TestConfigModel,
    CTRLModel,
    PythonPathModel,
    WaitConfigModel,
    ConfigurationModel,
    EmailOptionsModel,
)

from .serializers import (
    SITVersionSerializer,
    SITSerializer,
    STATSerializer,
    TestSuiteSerializer,
    SUTClientConfigSerializer,
    TestConfigSerializer,
    CTRLSerializer,
    PythonPathSerializer,
    WaitConfigSerializer,
    ConfigurationSerializer,
    EmailOptionsSerializer,
)

from rest_framework import viewsets
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from .serializers import ConfigurationSerializer
from django.http import JsonResponse
# Create your views here.

class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or request.user.is_authenticated 

class ConfigurationView(viewsets.ModelViewSet):
    queryset = ConfigurationModel.objects.all()
    serializer_class = ConfigurationSerializer


class EmailOptionsView(viewsets.ModelViewSet):
    queryset = EmailOptionsModel.objects.all()
    serializer_class = EmailOptionsSerializer


class DownloadConfigFile(APIView):
    permission_classes = []
    def get(self, request, pk=None, *args, **kwargs):
        config = get_object_or_404(ConfigurationModel, pk=pk)
        serializer = ConfigurationSerializer(config)
        response = JsonResponse(serializer.data, json_dumps_params={'indent': 2})
        response['Content-Disposition'] = f'attachment; filename="config_{pk}.json"'
        return response