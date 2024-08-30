import os
from celery import shared_task
from django.contrib.auth import get_user_model
from ..models import VirtualEnvironment, TestJob


def run_test(self, venv_name, test_case_id, **kwargs):
    user = get_user_model().objects.get(id=kwargs.get("user"))
    venv = VirtualEnvironment.objects.get(user=user, name=venv_name)
    test_case = TestJob.objects.get(id=test_case_id)
    # Run the test case
    print(f"Running test case {test_case_id} in venv {venv_name}")
    # Update the test case result
    # test_case_result = TestJobResult.objects.create(
    #     test_case=test_case, status="running", user=user
    # )
    # Run the test case
    # ...
    # Update the test case result
    # test_case_result.status = "completed"
    # test_case_result.save()
    print(f"Test case {test_case_id} completed in venv {venv_name}")
