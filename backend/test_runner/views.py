# from django.shortcuts import render
from rest_framework import viewsets
from .serializers import TestCaseSerializer, TestCaseResultSerializer, TestRunSerializer
from .models import TestCase, TestRun, TestCaseResult
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
import subprocess
import os
from django.conf import settings

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


class CreateVenvView(APIView):
    def post(self, request):
        # Example: Create a new virtual environment
        venv_name = request.data.get("venv_name")
        venv_path = os.path.join(settings.BASE_DIR, "venvs", venv_name)
        subprocess.run(["python", "-m", "venv", venv_path])
        return Response(
            {"message": "Virtual environment created"}, status=status.HTTP_201_CREATED
        )


class RunTestView(APIView):
    def post(self, request):
        # Example: Run a test script
        venv_name = request.data.get("venv_name")
        script_path = request.data.get("script_path")
        venv_path = os.path.join(settings.BASE_DIR, "venvs", venv_name, "bin", "python")
        result = subprocess.run(
            [venv_path, script_path], capture_output=True, text=True
        )
        return Response(
            {"stdout": result.stdout, "stderr": result.stderr},
            status=status.HTTP_200_OK,
        )
