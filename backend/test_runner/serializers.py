from datetime import datetime

from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from django.utils.dateformat import format
from rest_framework import serializers

from .models import (
    CtrlPackageRepo,
    RequirementsModel,
    Server,
    SubTests,
    TestCase,
    TestCaseResult,
    TestJob,
    TestRun,
    VirtualEnvironment,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username"]


class SubTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTests
        fields = ["test_case", "name", "path"]


class TestCaseSerializer(serializers.ModelSerializer):
    subtests = SubTestSerializer(many=True, read_only=True)
    created_at = serializers.SerializerMethodField()
    modified_at = serializers.SerializerMethodField()
    # subtests = serializers.ListField(child=serializers.CharField())

    class Meta:
        model = TestCase
        fields = "__all__"

    def get_created_at(self, obj):
        return format(
            obj.created_at, "F j, Y, P"
        )  # Example: "September 4, 2024, 3:55 AM"

    def get_modified_at(self, obj):
        return format(
            obj.modified_at, "F j, Y, P"
        )  # Example: "September 4, 2024, 3:55 AM"


class TestCaseResultSerializer(serializers.ModelSerializer):
    test_run = serializers.StringRelatedField()

    class Meta:
        model = TestCaseResult
        fields = "__all__"


class TestJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestJob
        fields = "__all__"


class TestRunSerializer(serializers.ModelSerializer):
    test_job = TestJobSerializer()

    class Meta:
        model = TestRun
        fields = "__all__"
        read_only_fields = ["log_file"]


class CreateVenvSerializer(serializers.Serializer):
    venv_name = serializers.CharField(max_length=100)


class RunTestSerializer(serializers.Serializer):
    venv_name = serializers.CharField(max_length=100)
    script_path = serializers.CharField(max_length=255)


class VirtualEnvironmentSerializer(serializers.ModelSerializer):
    # test_jobs = TestJobSerializer(many=True)
    # ctrl_package_version = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)
    # test_jobs = serializers.StringRelatedField(many=True, read_only=True)
    venv_name = serializers.CharField(read_only=True)
    nickname = serializers.CharField(max_length=100, required=True)
    # user = UserSerializer(read_only=True)

    class Meta:
        model = VirtualEnvironment
        exclude = [
            # "venv_name",  # Exclude because it is set automatically
            # "status",  # Exclude because this is managed internally or by task
            "last_used_at",  # Exclude because it is updated based on usage
            "user",  # Exclude because it is set based on the current logged-in user
            "lease_duration",  # Exclude because it is set based on the current logged-in user
            "assigned_at",  # Exclude because it is set based on the current logged-in user
            "path",  # Exclude because it is set automatically
            "server",  # Exclude because it is set by server (in future)
            # "test_jobs",  # Exclude because it's not defined in the current model context
            "script",  # Exclude because it is set by the user
        ]

    def create(self, validated_data):
        print(f"Nickname called : {validated_data['nickname']}")
        # Get the user from context or pass it through some means
        user = self.context["request"].user  # Get the user from the context
        validated_data["user"] = user  # Manually set the user field
        venv_name = validated_data["venv_name"]  # Manually set the user field
        print("Venv name in VirtualEnvironmentSerializer is : ", venv_name)
        if venv_name.strip() == "" or not venv_name:
            # Save the instance partially to generate the primary key
            instance = super().create(
                validated_data
            )  # Create the initial instance without venv_name

            venv_name = f"myPytestVenv_{instance.pk}"
            print("New unique venv name is : ", venv_name)
            validated_data["venv_name"] = venv_name
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        print("Ctrl pkg version in to_representation: ", instance.ctrl_package_version)
        if data["ctrl_package_version"]:
            data["ctrl_package_version"] = instance.ctrl_package_version.repo_version
        return data


class VirtualEnvironmentInitSerializer(serializers.ModelSerializer):
    # test_jobs = TestJobSerializer(many=True)

    class Meta:
        model = VirtualEnvironment
        fields = ["venv_name"]
        # exclude = [
        #     "status",  # Exclude because this is managed internally or by task
        #     "last_used_at",  # Exclude because it is updated based on usage
        #     "user",  # Exclude because it is set based on the current logged-in user
        #     "lease_duration",  # Exclude because it is set based on the current logged-in user
        #     "assigned_at",  # Exclude because it is set based on the current logged-in user
        #     "path",  # Exclude because it is set automatically
        #     "server",  # Exclude because it is set by server (in future)
        #     # "test_jobs",  # Exclude because it's not defined in the current model context
        # ]


class ServerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Server
        fields = "__all__"


class VirtualEnvironmentTestJobSerializer(serializers.ModelSerializer):
    test_cases = serializers.ListField(child=serializers.CharField())
    # user = serializers.SerializerMethodField()

    class Meta:
        model = VirtualEnvironment
        fields = ["venv_name", "test_cases"]

        """
        The serializers.SerializerMethodField tells the serializer to look for a method
        named get_user on the serializer class itself. This is a convention in Django REST Framework.

        When the serializer is serializing an instance of the VirtualEnvironment model,
        it will automatically look for a method named get_user on the serializer class.
        If it finds the method, it will call it with the instance as an argument and
        use the return value as the value for the user field.
        """

    # def get_user(self, instance):
    #     return UserSerializer(instance.user).data

    def create(self, validated_data, **kwargs):
        print(f"Validated data: {validated_data}")
        # user_id = kwargs.pop("user_id")
        user = self.context.get("user")  # Get user from context
        # user = validated_data.pop("user")
        venv_name = validated_data.pop("venv_name")
        test_cases = validated_data.pop("test_cases")
        print(f"User in serialiazer is {user}")
        # user = User.objects.get(id=user_id)

        venv = VirtualEnvironment.objects.get(venv_name=venv_name, user=user)

        # Use a list to collect errors for invalid test case IDs
        invalid_test_cases = []

        """
        1. Create a test case object and add test run details to it
        2. Then create a Test Run object from the test case
        3. Then create a Test Job object from the test run which is what the
        celery manages._
        """

        with transaction.atomic():
            for test_case_id in test_cases:
                try:
                    tc_obj = TestCase.objects.get(tcid=test_case_id)
                    print(f"Test case object: {tc_obj}")
                    tr_obj = TestRun.objects.create(test_case=tc_obj, user=user)
                    print(f"Test run object: {tr_obj}")
                    tr_job = TestJob.objects.create(test_run=tr_obj)
                    print(f"Test run job object: {tr_job}\n\n")
                    venv.test_jobs.add(tr_job)
                except TestCase.DoesNotExist:
                    invalid_test_cases.append(test_case_id)
            venv.save()

        print("Wowizee...it was fast. All of it worked.")

        if invalid_test_cases:
            raise serializers.ValidationError(
                f"TestCase(s) with ID(s) {', '.join(invalid_test_cases)} do not exist."
            )

        return venv


class CtrlPackageRepoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CtrlPackageRepo
        fields = "__all__"


class VenvsStatusJobsUsersSerializer(serializers.ModelSerializer):
    # test_jobs = TestJobSerializer(many=True)
    # user = UserSerializer()
    status = serializers.CharField(read_only=True)
    venv_name = serializers.CharField(read_only=True)
    # ctrl_package_version = (
    #     serializers.SerializerMethodField()
    # )  # represent the str rep of the object
    """
    https://chatgpt.com/share/758a96f2-b506-4ee3-aaad-9f420adfbe7f
    """

    class Meta:
        model = VirtualEnvironment
        fields = [
            "venv_name",
            "status",
            # "user",
            "test_jobs",
            "modified_at",
            # "ctrl_package_version",
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["test_jobs"] = (
            instance.test_jobs.count()
        )  # Assuming related name is 'test_jobs'
        representation["user"] = instance.user.username
        return representation

    # def get_ctrl_package_version(self, obj):
    #     if obj.ctrl_package_version is None:
    #         return None
    #     return str(obj.ctrl_package_version.repo_version)


class RequirementsModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequirementsModel
        fields = ["nickname", "requirements", "description"]
