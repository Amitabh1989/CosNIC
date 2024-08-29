from .models import (
    TestCase,
    TestRun,
    TestCaseResult,
    VirtualEnvironment,
    TestJob,
    Server,
)
from rest_framework import serializers
from django.contrib.auth.models import User


class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = "__all__"


class TestCaseResultSerializer(serializers.ModelSerializer):
    test_run = serializers.StringRelatedField()
    test_run = serializers.StringRelatedField()

    class Meta:
        model = TestCaseResult
        fields = "__all__"


class TestRunSerializer(serializers.ModelSerializer):
    test_cases = serializers.PrimaryKeyRelatedField(
        queryset=TestCase.objects.all(), many=True
    )
    # Reverse relationship here
    test_case_results = TestCaseResultSerializer(
        source="testcaseresult_set", many=True, read_only=True
    )

    class Meta:
        model = TestRun
        fields = "__all__"

    def create(self, validated_data):
        test_cases = validated_data.pop("test_cases")
        test_run = TestRun.objects.create(**validated_data)
        for test_case in test_cases:
            TestCaseResult.objects.create(test_run=test_run, test_case=test_case)
        return test_run


class CreateVenvSerializer(serializers.Serializer):
    venv_name = serializers.CharField(max_length=100)


class RunTestSerializer(serializers.Serializer):
    venv_name = serializers.CharField(max_length=100)
    script_path = serializers.CharField(max_length=255)


class TestJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestJob
        fields = "__all__"


class VirtualEnvironmentSerializer(serializers.ModelSerializer):
    # test_jobs = TestJobSerializer(many=True)
    class Meta:
        model = VirtualEnvironment
        fields = "__all__"


class ServerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Server
        fields = "__all__"


class VirtualEnvironmentTestJobSerializer(serializers.ModelSerializer):
    test_jobs = TestJobSerializer(many=True)

    class Meta:
        model = VirtualEnvironment
        fields = ["test_jobs", "name"]

    def create(self, validated_data):
        test_jobs = validated_data.pop("test_jobs")
        user_id = validated_data.pop("user_id")
        venv_name = validated_data.pop("venv_name")
        user = User.objects.get(id=user_id)

        venv = VirtualEnvironment.objects.get(name=venv_name, user=user)
        for test_job in test_jobs:
            TestJob.objects.create(venv=venv, **test_job)
        return venv
