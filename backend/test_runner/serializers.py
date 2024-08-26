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
