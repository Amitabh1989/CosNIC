# from django.shortcuts import render
import os
import time

from celery.result import AsyncResult
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.urls import reverse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotAuthenticated
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    CtrlPackageRepo,
    RequirementsModel,
    TestCase,
    TestCaseResult,
    TestRun,
    VirtualEnvironment,
)
from .paginations import CustomLimitOffsetPagination
from .serializers import (
    CtrlPackageRepoSerializer,
    RequirementsModelSerializer,
    TestCaseResultSerializer,
    TestCaseSerializer,
    TestRunSerializer,
    VenvsStatusJobsUsersSerializer,
    VirtualEnvironmentInitSerializer,
    VirtualEnvironmentSerializer,
    VirtualEnvironmentTestJobSerializer,
)
from .tasks.repo_jobs import scan_folder_and_update_cache
from .tasks.test_jobs import run_test_task
from .tasks.testcases_jobs import update_testcase_subtests

# from tasks.venv_manager import create_venv
from .tasks.venv_jobs import (
    copy_install_packages_to_venv_task,
    create_venv_task,
    sanitize_venv_name,
)

# Create your views here.


class TestCaseView(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    pagination_class = CustomLimitOffsetPagination

    def list(self, request):
        queryset = self.get_queryset().order_by("-created_at")
        serializer = TestCaseSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TestRunView(viewsets.ModelViewSet):
    queryset = TestRun.objects.all()
    serializer_class = TestRunSerializer


class TestCaseResultView(viewsets.ModelViewSet):
    queryset = TestCaseResult.objects.all()
    serializer_class = TestCaseResultSerializer


class UpdateTestCaseSubtestsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        task = update_testcase_subtests.apply_async()
        return Response(
            {"message": "Subtests updated", "task_id": task.id},
            status=status.HTTP_200_OK,
        )


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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Request data: ", request.data)
        # user = get_user_model().objects.get(username=self.request.user.username)
        user = request.user

        if self.queryset.filter(user=user).count() >= settings.MAX_VENVS_PER_USER:
            return Response(
                {
                    "message": f"Maximum number of Venvs ({settings.MAX_VENVS_PER_USER}/user) allocated. Kindly reuse / reset existing Venvs"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ctrl_package_version_id = request.data.get("ctrl_package_version", None)
        # venv_name = sanitize_venv_name(venv_name)
        print("ctrl_package_version name : ", ctrl_package_version_id)

        config_file = request.data.get("config_file", None)
        print("Config file : ", config_file)
        config_file = config_file[0] if config_file else None

        # Handle file uploads
        if "requirements" in request.FILES:
            requirements_file = request.FILES.get("requirements")
            print(f"Requirements file : {requirements_file}")
        else:
            requirements_file = None

        if "script" in request.FILES:
            script_file = request.FILES.get("script")
            print(f"Script file : {script_file}")
        else:
            script_file = None

        # Prepare data for the serializer
        data = {
            # "venv_name": venv_name,
            "python_version": request.data.get("python_version"),
            "nickname": request.data.get("nickname"),
            "requirements": requirements_file,
            "script": script_file,
            "user": user.id,
            "ctrl_package_version_id": ctrl_package_version_id,
        }

        print(f"Processed data is : {data}")

        # Send to serializer :
        serializer = self.serializer_class(data=data, context={"request": request})
        # Save the files to the VirtualEnvironment object
        if serializer.is_valid():
            # Save the object to get the pk
            instance = serializer.save()
            print(
                f"Virtual environment myPytestVenv_{instance.pk} instance creation in "
                "progress for user {user.username}. Spwanning VENV"
            )

            task = create_venv_task.delay(
                venv_name=f"myPytestVenv_{instance.pk}",
                python_version=data["python_version"],
                nickname=data["nickname"],
                user_id=user.id,
                requirements_file=(
                    requirements_file.read() if requirements_file else None
                ),
                script_file=script_file.read() if script_file else None,
                config_file_id=config_file,
            )

            # Generate the task status URL
            relative_url = reverse("task_status", kwargs={"task_id": task.id})
            status_url = request.build_absolute_uri(relative_url)
            return Response(
                {
                    "task_id": task.id,
                    "venv_name": f"myPytestVenv_{instance.pk}",
                    "message": "Virtual environment creation initiated.",
                    "status_url": status_url,
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

    # queryset = VirtualEnvironment.objects.all()
    # serializer_class = VirtualEnvironmentSerializer
    permission_classes = [AllowAny]

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


class ActivateVenvCopyInstallPackages(APIView):
    queryset = VirtualEnvironment.objects.all()
    serializer_class = VirtualEnvironmentInitSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Request must contain ctrl_package_version from the drop down present in the frontend.
        User will be presented with 2 more options in the GUI, inlline iwth above comment.
        1. Show the ctrl package version on the VENV + Config File associated with it
        2. Give list of Ctrl Packages and Script files to choose from
        3. Ask if user needs to update only if versions dont match (can be a default option)
        4. Force update option

        # TODO : Check if the celery task needs to copy new files and config file in case the
        user selects a new / different ctrl package version to run new batch of tests.
        """
        user = get_user_model().objects.get(username=self.request.user.username)
        venv_name = request.data.get("venv_name")
        print(f"Venv name received in the request : {venv_name}")

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
        }
        task = copy_install_packages_to_venv_task.apply_async(
            kwargs=data_for_task, countdown=2
        )

        return Response(
            {
                "message": "VENV copy, install, activation in progress",
                "task_id": task.id,
            },
            status=status.HTTP_201_CREATED,
        )


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
            # task = run_test_task.apply_async(args=[venv_name, user.id])
            data = {
                "venv_name": venv_name,
                "user_id": user.id,
            }
            test_run_id = "test_run_123"  # This would be dynamically generated
            live_log_url = f"ws://localhost:6789/livelogs/{test_run_id}"
            task = run_test_task.apply_async(kwargs=data)
            print(f"Task ID : {task.id}")
            return Response(
                {
                    "message": f"All test jobs have been created on Venv {venv_name} successfully",
                    "live_logs_url": live_log_url,
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
        # time.sleep(30)
        print(f"Post request is {request.data}")
        scan_folder_and_update_cache.delay()  # Use delay() to run it asynchronously
        return Response({"status": "Scan started"})


class CtrlRepoListView(viewsets.ModelViewSet):
    # ModelView set is used here inspite of the fact its more suited for CRUD operation
    # This is because we are using the default methods of the ModelViewSet and same url can
    # be used for get and list operations
    queryset = CtrlPackageRepo.objects.all()
    serializer_class = CtrlPackageRepoSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["get"], url_path="repo-versions")
    def get_all_available_repos(self, request):
        versions = self.queryset.values_list("repo_version", flat=True).distinct()
        return Response({"repo_versions": list(versions)}, status=status.HTTP_200_OK)


class GetUserVenvs(viewsets.ModelViewSet):
    queryset = VirtualEnvironment.objects.all()
    serializer_class = VirtualEnvironmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomLimitOffsetPagination

    def retrieve(self, request, pk=None, *args, **kwargs):
        print(f"Request in the retreive : {request} and data is {request.data}")
        if request.user.is_authenticated:
            user = User.objects.get(username=request.user.username)
            venv_data = VirtualEnvironment.objects.get(id=pk, user=user)
            print(f"Venv data : {venv_data}")
            # data=venv_data has not been used here as data=venv_data would have been used on incoming data. Sanitize that data
            # Since data= keyword has not been used, we do not need to user serializer.is_valid as well

            serializer = self.serializer_class(venv_data)
            print(f"Serializer data : {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(
            {"error": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    def list(self, request, *args, **kwargs):
        print(f"Request in the list : {request}")
        if request.user.is_authenticated:
            user = User.objects.get(username=request.user.username)
            queryset = VirtualEnvironment.objects.filter(user=user).order_by(
                "ctrl_package_version"
            )
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                print("Serialized data is : ", serializer.data)
                return self.get_paginated_response(serializer.data)
            return Response(
                {"message": "No Venvs found"}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(
            {"message": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED
        )


# class VenvStatusView(APIView):
class VenvStatusView(viewsets.ModelViewSet):
    queryset = VirtualEnvironment.objects.all()
    serializer_class = VenvsStatusJobsUsersSerializer
    pagination_class = CustomLimitOffsetPagination
    # permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        # Get the username or user ID from the request
        print(f"Request in the retreive : {request}")
        print(f"Request in the kwargs : {kwargs}")
        venv_name = kwargs.get("venv_name", None)
        venv_id = kwargs.get("pk", None)
        print(f"venv_id Id is : {venv_id}")

        # user = request.user
        user = User.objects.get(username=request.user.username)
        try:
            if venv_id:
                venv = VirtualEnvironment.objects.get(id=venv_id, user=user)
            elif venv_name:
                venv = VirtualEnvironment.objects.get(venv_name=venv_name, user=user)
        except VirtualEnvironment.DoesNotExist:
            return Response(
                {
                    "message": f"Venv {venv_name if venv_name else venv_id} not found under user {user.username}"
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        # Handle the case where the user doesn't exist
        return Response(
            {
                "user": venv.user.username,
                "venv_name": venv.venv_name,
                "status": venv.status,
                "modified_at": venv.modified_at,
                "num_test_cases": venv.test_jobs.count(),
                "nickname": venv.nickname,
                "ctrl_package_version": venv.ctrl_package_version.repo_version,
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    def list(self, request):
        print(f"Returning from list here : VenvStatusView : {request.data}")
        # user = request.user
        user = User.objects.get(username=request.user.username)
        print(f"Returning from list here : user : {user}")
        # queryset = self.get_queryset().order_by("user", "status")
        queryset = VirtualEnvironment.objects.filter(user=user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # If no pagination is needed, return the whole queryset
        serializer = self.get_serializer(queryset, many=True)
        print(f"Serializer data : {serializer.data}")
        return Response(serializer.data)


class RequirementsModelView(viewsets.ModelViewSet):
    queryset = RequirementsModel.objects.all()
    serializer_class = RequirementsModelSerializer
    permission_classes = [AllowAny]

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
