# from django.shortcuts import render
from rest_framework import viewsets
from .serializers import (
    TestCaseSerializer,
    TestCaseResultSerializer,
    TestRunSerializer,
    VirtualEnvironmentSerializer,
    VirtualEnvironmentTestJobSerializer,
    VirtualEnvironmentInitSerializer,
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
from celery.result import AsyncResult
from rest_framework.permissions import IsAuthenticated

# from tasks.venv_manager import create_venv
from .tasks.venv_jobs import create_venv, copy_install_packages_to_venv
from django.contrib.auth import get_user_model
from .tasks.repo_jobs import scan_folder_and_update_cache
from .tasks.test_jobs import run_test_job
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
from .forms import VirtualEnvironmentForm

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


def temp_save_uploaded_files(request):
    # Save files temporarily
    temp_dir = os.path.join(settings.LOGS_ROOT, "temp")
    os.makedirs(temp_dir, exist_ok=True)

    temp_requirements_path = None
    temp_script_path = None

    if "requirements" in request.FILES:
        temp_requirements_path = os.path.join(
            temp_dir, request.FILES["requirements"].name
        )
        with default_storage.open(temp_requirements_path, "wb+") as destination:
            for chunk in request.FILES["requirements"].chunks():
                destination.write(chunk)

    if "script" in request.FILES:
        temp_script_path = os.path.join(temp_dir, request.FILES["script"].name)
        with default_storage.open(temp_script_path, "wb+") as destination:
            for chunk in request.FILES["script"].chunks():
                destination.write(chunk)


class CreateVenvView(APIView):
    queryset = VirtualEnvironment.objects.all()
    serializer_class = VirtualEnvironmentSerializer

    def post(self, request):
        print("Request data: ", request.data)
        user = get_user_model().objects.get(username=self.request.user.username)

        venv_name = request.data.get("venv_name", None)
        config_file = request.data.get("config_file", None)
        print("Config file : ", config_file)
        config_file = config_file[0] if config_file else None
        # Check if name is unique
        print(
            f"Venv name : {VirtualEnvironment.objects.filter(user=user, venv_name=venv_name)}"
        )
        if VirtualEnvironment.objects.filter(user=user, venv_name=venv_name).exists():
            return Response(
                {"message": "Venv name already exists, use a unique name"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not venv_name:
            return Response(
                {"message": "Venv name cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Handle file uploads
        if "requirements" in request.FILES:
            requirements_file = request.FILES.get("requirements")

        if "script" in request.FILES:
            script_file = request.FILES.get("script")
        print(f"Requirements file : {requirements_file}")
        print(f"Script file : {script_file}")

        # Prepare data for the serializer
        data = {
            "venv_name": venv_name,
            "python_version": request.data.get("python_version"),
            "nickname": request.data.get("nickname"),
            "requirements": requirements_file,
            "script": script_file,
            "user": user.id,
        }

        print(f"Processed data is : {data}")

        # Send to serializer :
        serializer = self.serializer_class(data=data)
        # Save the files to the VirtualEnvironment object
        if serializer.is_valid():
            print(
                f"Virtial environment {venv_name} instance creation in progress for user {user.username}. Spwanning VENV"
            )

            task = create_venv.delay(
                venv_name=venv_name,
                python_version=data["python_version"],
                nickname=data["nickname"],
                user_id=user.id,
                requirements_file=(
                    requirements_file.read() if requirements_file else None
                ),
                script_file=script_file.read() if script_file else None,
                config_file_id=config_file,
            )
            return Response(
                {
                    "task_id": task.id,
                    "message": "Virtual environment creation initiated.",
                },
                status=status.HTTP_202_ACCEPTED,
            )
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(
                {"message": "Validation error", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
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


# class RunTestView(APIView):
#     def post(self, request):
#         # Example: Run a test script
#         venv_name = request.data.get("venv_name")
#         script_path = request.data.get("script_path")
#         venv_path = os.path.join(settings.BASE_DIR, "venvs", venv_name, "bin", "python")
#         # trunk-ignore(bandit/B603)
#         result = subprocess.run(
#             [venv_path, script_path], capture_output=True, text=True, shell=False
#         )
#         return Response(
#             {"stdout": result.stdout, "stderr": result.stderr},
#             status=status.HTTP_200_OK,
#         )


class ActivateVenvCopyInstallPackages(APIView):
    queryset = VirtualEnvironment.objects.all()
    # serializer_class = VirtualEnvironmentSerializer
    serializer_class = VirtualEnvironmentInitSerializer
    # form_class = VirtualEnvironmentForm

    def post(self, request):
        # form = self.form_class(request.data)
        # if form.is_valid():
        # Process form data
        # Example: Run a test script
        user = get_user_model().objects.get(username=self.request.user.username)
        venv_name = request.data.get("venv_name")
        print(f"Venv name received in the request : {venv_name}")
        # ctrl_package_version = request.data.get("ctrl_package_version", False)
        # The code is attempting to retrieve the value of the "ctrl_package_version" key from the data in a request object. If the key is not found in the data, it will default to False.
        # if not ctrl_package_version:
        # ctrl_package_version = "latest"
        # print(f"Venv ctrl_package_version in the request : {ctrl_package_version}")

        if not VirtualEnvironment.objects.filter(
            user=user, venv_name=venv_name
        ).exists():
            return Response(
                {
                    "message": f"No VENV named {venv_name} found associated with user {user.username}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data_for_task = {
            "venv_name": venv_name,
            "user": user.id,
            # "ctrl_package_version": ctrl_package_version,
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
        print(f"Got the request : {request.data}")
        venv_name = self.request.data.get("venv_name")
        test_cases = self.request.data.get("test_cases")  # list of test scripts to run

        # Check user authentication (assuming it's required)
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = get_user_model().objects.get(username=self.request.user.username)
        # user_id = user.is_authenticated
        data = {
            "venv_name": venv_name,
            # "user": user,
            "test_cases": test_cases,
        }
        print(f"User data : {data}")
        serializer = self.serializer_class(data=data, context={"user": user})
        if serializer.is_valid():
            serializer.save()  # This will use the create method in VirtualEnvironmentSerializer

            # Here is where, we wil call the celery task and ask it to run all the JOBs.
            # Send the venv_name and user to the job.
            # Extract the venv and user objects, fetch all the test jobs and run them one by one
            task = run_test_job.apply_async(args=[venv_name, user.id])
            print(f"Task ID : {task.id}")
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
        print(f"Repo version : {cache.repo_versions} : {type(cache.repo_versions)}")
        return Response(
            {"repo_versions": cache.repo_versions, "last_scanned": cache.last_scanned}
        )
