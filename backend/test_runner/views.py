# from django.shortcuts import render
from rest_framework import viewsets
from .serializers import TestCaseSerializer, TestCaseResultSerializer, TestRunSerializer
from .models import TestCase, TestRun, TestCaseResult

# Create your views here.


class TestCaseView(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer


class TestRunView(viewsets.ModelViewSet):
    queryset = TestRun.objects.all()
    serializer_class = TestRunSerializer


class TestCaseResultView(viewsets.ModelViewSet):
    queryset = TestCaseResult.objects.all()
    serializer_class = TestCaseResultSerializer
