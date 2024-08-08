from django.shortcuts import render
from .models import (
    SITVersionModel,
    SITModel,
    STATModel,
    TestSuiteModel,
    SUTClientConfigModel,
    TestConfigModel,
    CTRLModel,
    PythonPathModel,
    WaitConfigModel,
    ConfigurationModel,
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
)

from rest_framework import viewsets
from rest_framework.views import APIView

# Create your views here.


class ConfigurationView(viewsets.ModelViewSet):
    queryset = ConfigurationModel.objects.all()
    serializer_class = ConfigurationSerializer