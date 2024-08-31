import os
import subprocess
from celery import shared_task
from django.contrib.auth import get_user_model
from ..models import VirtualEnvironment, TestJob

from django.utils import timezone
import json
from django.core.files import File

# import zipfile
# from .venv_jobs import activate_venv, deactivate_venv


# def run_test(self, venv_name, test_case_id, **kwargs):
#     user = get_user_model().objects.get(id=kwargs.get("user"))
#     venv = VirtualEnvironment.objects.get(user=user, name=venv_name)
#     test_case = TestJob.objects.get(id=test_case_id)
#     # Run the test case
#     print(f"Running test case {test_case_id} in venv {venv_name}")
#     # Update the test case result
#     # test_case_result = TestJobResult.objects.create(
#     #     test_case=test_case, status="running", user=user
#     # )
#     # Run the test case
#     # ...
#     # Update the test case result
#     # test_case_result.status = "completed"
#     # test_case_result.save()
#     print(f"Test case {test_case_id} completed in venv {venv_name}")


"""
Venv -> TestJobs -> Run each test job
So Venv has all tests scheduled to run
Take all jobs and run them one by one
Once a test job completes, update the status of the job
Update the result of test runs and upload logs to FTP
Take next test job and run it.
Repeat until all jobs are completed
"""


def run_command_in_venv(venv_path, command):
    python_executable = (
        os.path.join(venv_path, "Scripts", "python.exe")
        if os.name == "nt"
        else os.path.join(venv_path, "bin", "python")
    )

    full_command = [python_executable] + command
    result = subprocess.run(full_command, check=True, text=True)
    return result.stdout


def run_command(command):
    try:
        result = subprocess.run(
            command, shell=True, check=True, text=True, capture_output=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        # Capture both stdout and stderr for debugging
        print(f"Command failed with exit code {e.returncode}")
        print(f"Output: {e.output}")
        print(f"Error: {e.stderr}")
        raise


def activate_venv(venv_path, command):
    if os.name == "nt":
        activate_script = os.path.join(venv_path, "Scripts", "activate.bat")
        # command = f'cmd.exe /c "{activate_script} & python {sys.argv[1]}"'
        command = f'cmd.exe /c "{activate_script} & {command}"'
    else:
        activate_script = os.path.join(venv_path, "bin", "activate")
        # command = f'bash -c "source {activate_script} && python {sys.argv[1]}"'
        command = f'bash -c "source {activate_script} && {command}"'

    print(f"Execution Command is : {command}")
    # result = subprocess.run(command, shell=False, check=True, text=True)
    result = run_command(command)
    return result.stdout


@shared_task
def run_test_job(venv_name, user_id):
    user = get_user_model().objects.get(id=user_id)
    venv_obj = VirtualEnvironment.objects.get(venv_name=venv_name, user=user)

    # Get all test jobs for the venv
    test_jobs = venv_obj.test_jobs.all().filter(status="pending")
    # activate_venv(venv_obj.path)
    print(f"Activated venv {venv_name}")
    venv_obj.status = "in-use"
    venv_obj.last_used_at = timezone.now()
    venv_obj.save()
    print(f"Test jobs to run: {test_jobs}")
    for job in test_jobs:
        log_file_path = os.path.join(os.path.dirname(__file__), "test_log.log")
        json_report_file_path = os.path.join(os.path.dirname(__file__), "result.json")
        test_run_obj = job.test_run
        test_run_obj.status = "running"
        test_run_obj.modified_at = timezone.now()
        test_run_obj.log_file = log_file_path
        test_run_obj.save()
        # zip_file_path = create_path(job.test_run, "test_run.zip")
        # Run the test job
        print(f"Running test job {job.id} in venv {venv_name}")
        # Update the test job status
        job.status = "running"
        job.save()
        cmd = f"pytest {job.test_run.test_case.path} --log-file={log_file_path} --json-report --json-report-file={json_report_file_path}"
        # Run the test job
        # cmd = "pytest {path} --log-file=test_log.log".format(
        #     path=job.test_run.test_case.path
        # )
        print(f"CMD is {cmd}")
        # result = subprocess.run(cmd, shell=False, capture_output=True, text=True)
        # print(f"Result of the test run : {result.stdout}")

        # result = run_command_in_venv(venv_obj.path, cmd.split())
        # print(f"Result of the test run : {result}")
        result = activate_venv(venv_obj.path, cmd)
        print(f"Result of the test run : {result}")
        # Zip the files
        # with zipfile.ZipFile(zip_file_path, "w") as zipf:
        #     zipf.write(base_log_path, os.path.basename(base_log_path))
        #     zipf.write(base_json_report_path, os.path.basename(base_json_report_path))

        # ...
        # Update the test job status
        job.status = "completed"
        job.save()
        # test_run_obj.report_file = json_report_file_path
        # test_run_obj.save()

        # Update test_run_obj with file references
        test_run_obj = job.test_run
        test_run_obj.status = "passed"
        test_run_obj.modified_at = timezone.now()
        test_run_obj.log_file.save(
            os.path.basename(log_file_path), File(open(log_file_path, "rb"))
        )
        test_run_obj.report_file.save(
            os.path.basename(json_report_file_path),
            File(open(json_report_file_path, "rb")),
        )
        test_run_obj.save()
        print(f"LOgs json uploaded to : {test_run_obj.log_file.url}")
        print(f"Reports json uploaded to : {test_run_obj.report_file.url}")

        parse_json_report(json_report_file_path)

        # Update test run result
        test_run_obj.status = "passed" if "passed" in result.stdout else "failed"
        test_run_obj.modified_at = timezone.now()
        test_run_obj.save()
        # Get the logs and upload to the FTP
        # Update the test run result log FTP location
        print(f"Test job {job.id} completed in venv {venv_name}")
    # Setting venv status to free
    print(f"Setting venv {venv_name} status to free")
    venv_obj.status = "free"
    venv_obj.last_used_at = timezone.now()
    venv_obj.save()
    # deactivate_venv(venv_obj.path)


# "--json-report", "--json-report-file=result.json"]


def parse_json_report(file_path):
    with open(file_path, "r") as f:
        data = json.load(f)

    summary = data.get("summary", {})
    tests = data.get("tests", [])

    # Print Summary
    print(f"Total Tests: {summary.get('total', 0)}")
    print(f"Passed: {summary.get('passed', 0)}")
    print(f"Failed: {summary.get('failed', 0)}")
    print(f"Skipped: {summary.get('skipped', 0)}\n")

    # Print Test Details
    for test in tests:
        print(f"Test Name : {test.get('nodeid', 'N/A')}")
        status = test.get("outcome", "N/A")
        print(f"Status    : {status}")
        print(f'Duration  : {test["call"]["duration"]}s')
        if status == "failed":
            print(f'Log path  : {test["call"]["crash"].get("message", "N/A")}\n')


# # Example usage
# parse_json_report("result.json")
