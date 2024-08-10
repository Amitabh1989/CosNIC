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
    EmailOptionsModel
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
    EmailOptionsSerializer
)

from rest_framework import viewsets
from rest_framework.views import APIView

# Create your views here.


class ConfigurationView(viewsets.ModelViewSet):
    queryset = ConfigurationModel.objects.all()
    serializer_class = ConfigurationSerializer


class EmailOptionsView(viewsets.ModelViewSet):
    queryset = EmailOptionsModel.objects.all()
    serializer_class = EmailOptionsSerializer