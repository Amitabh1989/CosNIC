from .models import TestCase, TestRun, TestCaseResult
from rest_framework import serializers


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
