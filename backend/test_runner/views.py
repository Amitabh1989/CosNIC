# from django.shortcuts import render
from rest_framework import viewsets
from .serializers import (
    TestCaseSerializer,
    TestCaseResultSerializer,
    TestRunSerializer,
    VirtualEnvironmentSerializer,
)
from .models import TestCase, TestRun, TestCaseResult, VirtualEnvironment
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
import subprocess
import os
from django.conf import settings
from celery.result import AsyncResult

# from tasks.venv_manager import create_venv
from .tasks.venv_manager import create_venv, copy_install_packages_to_venv
from django.contrib.auth import get_user_model

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
    queryset = VirtualEnvironment.objects.all()
    serializer_class = VirtualEnvironmentSerializer

    def post(self, request):
        # Example: Create a new virtual environment
        print("Request data: ", request.data)

        venv_name = request.data.get("venv_name")
        # Get the currently logged-in user (requires authentication)
        user = get_user_model().objects.get(username=self.request.user.username)

        print(f"User of the request: {user} {user.id} {user.email}")
        # task = create_venv.delay(venv_name)
        task = create_venv.apply_async(
            args=("my_venv_name",),
            kwargs={"version": "3.9", "user": user.id},
            countdown=10,
        )
        return Response(
            {"message": "Virtual environment created", "task_id": task.id},
            status=status.HTTP_201_CREATED,
        )


class TaskStatusView(APIView):

    queryset = VirtualEnvironment.objects.all()
    serializer_class = VirtualEnvironmentSerializer

    def get(self, request, task_id):
        task = AsyncResult(task_id)
        if task.ready():
            _status = task.status
            result = task.result
        else:
            _status = task.status
            result = "Task is still processing"

        return Response(
            {"task_id": task_id, "status": _status, "result": result},
            status=status.HTTP_200_OK,
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


class StartVenvCopyInstallPackages(APIView):
    queryset = VirtualEnvironment.objects.all()
    serializer_class = VirtualEnvironmentSerializer

    def post(self, request):
        # Example: Run a test script
        user = get_user_model().objects.get(username=self.request.user.username)
        venv_name = request.data.get("venv_name", "my_venv_name")
        # script_path = request.data.get("script_path")
        ctrl_package_version = request.data.get("ctrl_package_version", "latest")
        data_for_task = {
            "venv_name": venv_name,
            "user": user.id,
            "ctrl_package_version": ctrl_package_version,
        }
        task = copy_install_packages_to_venv.apply_async(
            kwargs=data_for_task, countdown=10
        )

        return Response(
            {
                "message": "VENV copy, install, activation in progress",
                "task_id": task.id,
            },
            status=status.HTTP_201_CREATED,
        )
