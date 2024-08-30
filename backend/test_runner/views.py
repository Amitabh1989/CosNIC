# from django.shortcuts import render
from rest_framework import viewsets
from .serializers import (
    TestCaseSerializer,
    TestCaseResultSerializer,
    TestRunSerializer,
    VirtualEnvironmentSerializer,
    VirtualEnvironmentTestJobSerializer,
)
from .models import (
    TestCase,
    TestRun,
    TestCaseResult,
    VirtualEnvironment,
    CtrlPackageRepo,
)
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
import subprocess
import os
from django.conf import settings
from celery.result import AsyncResult
from rest_framework.permissions import IsAuthenticated

# from tasks.venv_manager import create_venv
from .tasks.venv_jobs import create_venv, copy_install_packages_to_venv
from django.contrib.auth import get_user_model
from .tasks.repo_jobs import scan_folder_and_update_cache

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
        user = get_user_model().objects.get(username=self.request.user.username)

        venv_name = request.data.get("venv_name", None)
        # Check if name is unique
        # if self.get_queryset().filter(name=venv_name, user=user).exists():
        print(
            f"Venv name : {VirtualEnvironment.objects.filter(user=user, name=venv_name)}"
        )
        if VirtualEnvironment.objects.filter(user=user, name=venv_name).exists():
            return Response(
                {"message": "Venv name already exists, use a unique name"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not venv_name:
            return Response(
                {"message": "Venv name cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Get the currently logged-in user (requires authentication)

        print(f"User of the request: {user} {user.id} {user.email}")
        # task = create_venv.delay(venv_name)
        task = create_venv.apply_async(
            # args=("my_venv_name",),
            kwargs={"version": "3.9", "user": user.id, "venv_name": venv_name},
            countdown=10,
        )
        return Response(
            {
                "message": "Virtual environment creation request submitted",
                "task_id": task.id,
            },
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
        # trunk-ignore(bandit/B603)
        result = subprocess.run(
            [venv_path, script_path], capture_output=True, text=True, shell=False
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
        venv_name = request.data.get("name")
        print(f"Venv name received in the request : {venv_name}")
        ctrl_package_version = request.data.get("ctrl_package_version", False)
        if not ctrl_package_version:
            ctrl_package_version = "latest"
        print(f"Venv ctrl_package_version in the request : {ctrl_package_version}")

        if not VirtualEnvironment.objects.filter(user=user, name=venv_name).exists():
            return Response(
                {
                    "message": f"No VENV named {venv_name} found associated with user {user.username}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data_for_task = {
            "venv_name": venv_name,
            "user": user.id,
            "ctrl_package_version": ctrl_package_version,
        }
        task = copy_install_packages_to_venv.apply_async(
            kwargs=data_for_task, countdown=5
        )

        return Response(
            {
                "message": "VENV copy, install, activation in progress",
                "task_id": task.id,
            },
            status=status.HTTP_201_CREATED,
        )


# class RunTestsView(APIView):
#     queryset = VirtualEnvironment.objects.all()
#     serializer_class = VirtualEnvironmentSerializer

#     def post(self, request):
#         # test_case_list = request.data.get("test_cases")  # List of test case ids
#         # venv_name = request.data.get("venv_name")
#         # user = get_user_model().objects.get(username=self.request.user.username)

#         # try:
#         #     self.serializer_class.is_valid(raise_exception=True)
#         # except serializers.ValidationError as e:
#         #     return Response({"message": e}, status=status.HTTP_400_BAD_REQUEST)

#         # # Create or retrieve the VirtualEnvironment instance
#         # virtual_environment, created = VirtualEnvironment.object.get_or_create(
#         #     name="venv_name", user=user
#         # )

#         # serializer = self.serializer_class(virtual_environment, data=request.data)
#         serializer = self.serializer_class(data=request.data)

#         if serializer.is_valid():
#             serializer.save()  # This will use the create method in VirtualEnvironmentSerializer
#             return Response(
#                 {"message": "Virtual Environment and Test Jobs created successfully"},
#                 status=status.HTTP_201_CREATED,
#             )
#         else:
#             return Response(
#                 {"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
#             )


class RunTestsView(APIView):
    queryset = VirtualEnvironment.objects.all()
    serializer_class = VirtualEnvironmentTestJobSerializer

    def post(self, request):
        venv_name = self.request.data.get("venv_name")
        test_cases = self.request.data.get("test_cases")  # list of test scripts to run
        user = get_user_model().objects.get(username=self.request.user.username)
        user_id = user.is_authenticated
        data = {
            "venv_name": venv_name,
            "user_id": user_id,
            "test_cases": test_cases,
        }
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()  # This will use the create method in VirtualEnvironmentSerializer

            return Response(
                {
                    "message": f"All test jobs have been created on Venv {venv_name} successfully"
                },
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )


class ManualScanCtrlRepoView(APIView):
    permission_classes = [IsAuthenticated]  # Adjust based on your needs

    def post(self, request):
        scan_folder_and_update_cache.delay()  # Use delay() to run it asynchronously
        return Response({"status": "Scan started"})


class FolderListView(APIView):
    queryset = CtrlPackageRepo.objects.all()

    def get(self, request):
        cache = CtrlPackageRepo.objects.get(id=1)
        return Response(
            {"repo_versions": cache.repo_versions, "last_scanned": cache.last_scanned}
        )
