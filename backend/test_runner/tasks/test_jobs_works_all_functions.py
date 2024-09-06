import json
import logging
import os
import subprocess
import time

from celery import chain, shared_task
from django.contrib.auth import get_user_model
from django.core.files import File
from django.db import transaction
from django.utils import timezone

from ..models import TestJob, VirtualEnvironment
from ..tasks.repo_jobs import get_latest_ctrl_repo_version
from ..tasks.venv_jobs import copy_install_packages_to_venv_task

logger = logging.getLogger(__name__)
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

# cmd = f"pytest {tc_path} --log-file={log_file_path} --json-report --json-report-file={json_report_file_path}"
# logger.info(f"Command to execute : {cmd}")
# result = execute_script_in_venv(
#     venv_obj.path, tc_path, log_file_path, json_report_file_path
# )


# def execute_script_in_venv(venv_path, tc_path, log_file_path, json_report_file_path):
#     logger.info(
#         f"Executing script in venv: {venv_path}, tc_path: {tc_path} "
#         f"=> log_file_path : {log_file_path}, json_report_file_path : {json_report_file_path}"
#     )
#     python_executable = (
#         os.path.join(venv_path, "Scripts", "python.exe")
#         if os.name == "nt"
#         else os.path.join(venv_path, "bin", "python")
#     )
#     logger.info(f"Venv path : {venv_path}")
#     full_tc_path = os.path.join(venv_path, "Lib", "site-packages", tc_path)
#     command = f"pytest {full_tc_path} --log-file={log_file_path} --json-report --json-report-file={json_report_file_path}"
#     logger.info(f"python_executable 0 : {python_executable}")
#     logger.info(f"Full command at execution is : {command}")

#     full_command = python_executable + " -m " + command
#     logger.info(f"python_executable 1 : {python_executable}")
#     logger.info(f"command: {command}")
#     logger.info(f"Complete command: {full_command}")
#     result = subprocess.run(full_command, check=True, text=True, shell=False)
#     return result


def execute_script_in_venv(venv_path, tc_path, log_file_path, json_report_file_path):
    logger.info(
        f"Executing script in venv: {venv_path}, tc_path: {tc_path} "
        f"=> log_file_path : {log_file_path}, json_report_file_path : {json_report_file_path}"
    )
    python_executable = (
        os.path.join(venv_path, "Scripts", "python.exe")
        if os.name == "nt"
        else os.path.join(venv_path, "bin", "python")
    )

    # Strip leading slash if it exists
    if tc_path.startswith("/"):
        tc_path = tc_path.lstrip("/")
    logger.info(f"Venv path : {venv_path}")
    logger.info(f"tc_path: {tc_path}")

    # Remove the second assignment of full_tc_path
    full_tc_path = os.path.join(venv_path, "Lib", "site-packages", tc_path)

    logger.info(f"Full command path for the test case: {full_tc_path}")

    full_command = [
        python_executable,
        "-m",
        "pytest",
        full_tc_path,
        f"--log-file={log_file_path}",
        "--json-report",
        f"--json-report-file={json_report_file_path}",
    ]

    logger.info(f"Complete command: {full_command}")

    # Run the command with subprocess
    # result = subprocess.run(
    #     full_command,
    #     capture_output=True,
    #     text=True,
    #     shell=False,
    # )

    # return result
    return run_command(full_command)


def run_command(command):
    try:
        result = subprocess.run(
            command,
            # trunk-ignore(bandit/B603)
            shell=False,
            check=True,
            text=True,
            capture_output=True,
        )
        return result
    except subprocess.CalledProcessError as e:
        # Capture both stdout and stderr for debugging
        print(f"Command failed with exit code {e.returncode}")
        print(f"Output: {e.output}")
        print(f"Error: {e.stderr}")
        raise


def activate_venv(venv_path, command):
    print(f"Activating venv and running command: {command}")

    if os.name == "nt":
        activate_script = os.path.join(venv_path, "Scripts", "activate.bat")
        cmd = f'cmd.exe /c "{activate_script} && {command}"'
    else:
        activate_script = os.path.join(venv_path, "bin", "activate")
        cmd = f'bash -c "source {activate_script} && {command}"'

    print(f"Execution command: {cmd}")

    try:
        result = run_command(cmd)
        return result.stdout, result.stderr, result.returncode
    except subprocess.CalledProcessError as e:
        print(f"Command execution failed: {e}")
        return None, e.stderr, e.returncode


# @shared_task(bind=True, max_retries=5, default_retry_delay=60)
# def run_test_job(self, venv_name, user_id):
#     """
#     # TODO : Check if the celery task needs to copy new files and config file in case the
#     user selects a new / different ctrl package version to run new batch of tests.
#     """

#     try:
#         user = get_user_model().objects.get(id=user_id)
#         venv_obj = VirtualEnvironment.objects.get(venv_name=venv_name, user=user)
#     except (get_user_model().DoesNotExist, VirtualEnvironment.DoesNotExist) as e:
#         print(f"Error: {e}")
#         return

#     test_jobs = TestJob.objects.filter(venv=venv_obj, status="pending")

#     while True:
#         if venv_obj.status == "free" or test_jobs.count() == 0:
#             venv_obj.status = "in-use"
#             venv_obj.last_used_at = timezone.now()
#             venv_obj.save()
#             break
#         else:
#             # Wait and retry if venv is not free
#             print(f"Venv {venv_name} is in use. Retrying in 60 seconds...")
#             self.retry(countdown=60)

#     print(f"Activated venv {venv_name}")
#     print(f"Test jobs to run: {test_jobs.count()}")

#     try:
#         for job in test_jobs:
#             with transaction.atomic():
#                 log_file_path = os.path.join(os.path.dirname(__file__), "test_log.log")
#                 json_report_file_path = os.path.join(
#                     os.path.dirname(__file__), "result.json"
#                 )
#                 test_run_obj = job.test_run
#                 test_run_obj.status = "running"
#                 test_run_obj.modified_at = timezone.now()
#                 test_run_obj.log_file = log_file_path
#                 test_run_obj.save()

#                 # Run the test job
#                 print(f"Running test job {job.id} in venv {venv_name}")
#                 # Update the test job status
#                 job.status = "running"
#                 job.save()

#                 # Compose the command
#                 # Here since we never run subtests directly, makes sense to just use the test case path
#                 # We need to give the complete path to the test case file
#                 full_script_path = os.path.join(
#                     venv_obj.path, "Lib", "site-packages", job.test_run.test_case.path
#                 )
#                 print(f"Full script path: {full_script_path}")
#                 if os.path.exists(full_script_path):
#                 # cmd = f"pytest {job.test_run.test_case.path} --log-file={log_file_path} --json-report --json-report-file={json_report_file_path}"
#                     cmd = f"pytest {full_script_path} --log-file={log_file_path} --json-report --json-report-file={json_report_file_path}"
#                     print(f"CMD is {cmd}")

#                     # Activate the venv just in case
#                     stdout, stderr, returncode = activate_venv(venv_obj.path, cmd)
#                     if returncode == 0:
#                         print("Command executed successfully.")
#                     else:
#                         print(f"Command failed with return code {returncode}")
#                         print(f"Error output: {stderr}")

#                     # Start subprocess command
#                     result = execute_script_in_venv(venv_obj.path, cmd.split())
#                     print(
#                         f"Result of the test run : {result}, return code : {result.returncode}"
#                     )

#                     # Update the test job status
#                     # 1. Exit status of the child process. Typically, an exit status of 0 indicates that it ran successfully.
#                     # 2. A negative value -N indicates that the child was terminated by signal N (POSIX only).
#                     if result.returncode == 0:
#                         job.status = "completed"
#                         test_run_obj.status = "passed"

#                     elif result.returncode < 0:
#                         job.status = "aborted"
#                         test_run_obj.status = "aborted"
#                         test_run_obj.error_stack = result.stderr
#                         test_run_obj.error_code = (
#                             result.returncode
#                         )  # Right now its subprocess return code. But it will be transitioned to a NIC automation error code
#                         # test_run_obj.save()

#                     else:
#                         job.status = "failed"
#                         test_run_obj.status = "failed"
#                         test_run_obj.error_stack = result.stderr
#                         test_run_obj.error_code = (
#                             result.returncode
#                         )  # Right now its subprocess return code. But it will be transitioned to a NIC automation error code
#                         # test_run_obj.save()

#                     job.save()

#                 # Update test_run_obj with file references
#                 test_run_obj.modified_at = timezone.now()
#                 job.end_time = timezone.now()

#                 test_run_obj.log_file.save(
#                     os.path.basename(log_file_path), File(open(log_file_path, "rb"))
#                 )
#                 test_run_obj.report_file.save(
#                     os.path.basename(json_report_file_path),
#                     File(open(json_report_file_path, "rb")),
#                 )

#                 # print(f"Logs json uploaded to : {test_run_obj.log_file.url}")
#                 # print(f"Reports json uploaded to : {test_run_obj.report_file.url}")

#                 parse_json_report(json_report_file_path)

#                 # Update test run result
#                 test_run_obj.test_job = job
#                 test_run_obj.modified_at = timezone.now()
#                 test_run_obj.save()

#                 # Get the logs and upload to the FTP
#                 # Update the test run result log FTP location
#                 print(f"Test job {job.id} completed in venv {venv_name}")

#     except Exception as e:
#         # Handle the exception
#         print(f"Exception while executing the test job: {e}")
#         for job in test_jobs:
#             job.status = "failed"
#             job.end_time = timezone.now()
#             job.modified_at = timezone.now()
#             job.save()

#     finally:
#         # This will always execute, regardless of whether an exception occurred or not
#         print(f"Setting venv {venv_name} status to free")
#         venv_obj.status = "free"
#         venv_obj.last_used_at = timezone.now()
#         venv_obj.save()

#         # Optionally, re-raise the exception after cleanup
#         if "e" in locals():
#             raise e
# deactivate_venv(venv_obj.path)


# def install_ctrl_package_in_venv(venv_path: str, package_path: str) -> None:
#     """
#     Change directory to the virtual environment and install the controller package.

#     Args:
#         venv_path (str): Path to the virtual environment.
#         package_path (str): Path to the controller package to be installed.
#     """
#     # Change to the virtual environment directory
#     os.chdir(venv_path)

#     # Construct the command to change directory and install the package
#     # cmd = f"cd {venv_path} && pip install {package_path}"
#     cmd = f"pip install {package_path}"
#     print(f"Installing controller package with command: {cmd}")

#     # Execute the command
#     result = execute_script_in_venv(venv_path, cmd.split())
#     print(f"Controller package installation result: Return code {result.returncode}")


# @shared_task(bind=True, max_retries=5, default_retry_delay=60)
# def run_test_job(self, venv_name, user_id):
#     """
#     Celery task to run test jobs in a specified virtual environment.
#     """

#     # Helper function to handle the status update of test job and test run
#     def update_status(job, test_run_obj, status, error_stack=None, error_code=None):
#         job.status = status
#         job.end_time = timezone.now()
#         job.modified_at = timezone.now()
#         job.save()

#         test_run_obj.status = status
#         test_run_obj.modified_at = timezone.now()
#         if error_stack:
#             test_run_obj.error_stack = error_stack
#             test_run_obj.error_code = error_code
#         test_run_obj.save()

#     # Helper function to handle file uploads and parsing
#     def handle_files(test_run_obj, log_file_path, json_report_file_path):
#         test_run_obj.log_file.save(
#             os.path.basename(log_file_path), File(open(log_file_path, "rb"))
#         )
#         test_run_obj.report_file.save(
#             os.path.basename(json_report_file_path),
#             File(open(json_report_file_path, "rb")),
#         )
#         parse_json_report(json_report_file_path)

#     try:
#         user = get_user_model().objects.get(id=user_id)
#         venv_obj = VirtualEnvironment.objects.get(venv_name=venv_name, user=user)
#     except (get_user_model().DoesNotExist, VirtualEnvironment.DoesNotExist) as e:
#         print(f"Error: {e}")
#         return

#     test_jobs = TestJob.objects.filter(venv=venv_obj, status="pending")

#     try:
#         while True:
#             if venv_obj.status in ("free", "created") or test_jobs.count() == 0:
#                 venv_obj.status = "in-use"
#                 venv_obj.last_used_at = timezone.now()
#                 venv_obj.save()
#                 break
#             elif venv_obj.status == "error":
#                 venv_obj.status = "in-use"
#                 venv_obj.ctrl_package_version = None
#                 venv_obj.last_used_at = timezone.now()
#                 venv_obj.save()

#             else:
#                 print(f"Venv {venv_name} is in use. Retrying in 60 seconds...")
#                 self.retry(countdown=60)

#         # Check if controller package is installed. If yes, proceed. Else, install it.
#         # Check if the controller package is installed
#         print(
#             f"Controller package ver installed in venv {venv_obj.ctrl_package_version}"
#         )
#         if venv_obj.ctrl_package_version is None:
#             print("Controller package is not installed. Installing it now...")

#             # Get the latest version object
#             # version_to_install_obj = get_latest_ctrl_repo_version()

#             # Install the controller package
#             data_for_task = {
#                 "venv_name": venv_name,
#                 "user": str(user.id),
#                 "ctrl_package_version_id": get_latest_ctrl_repo_version().repo_version,
#             }
#             print(f"Data for task: {data_for_task}")
#             task = block_copy_install_packages_to_venv_task(kwargs=data_for_task)

#             print(f"Activated venv {venv_name} from path {venv_obj.path}")
#             print(f"Test jobs to run: {test_jobs.count()}")
#     except Exception as e:
#         print(f"Error while installing controller package: {e}")
#         venv_obj.status = "error"
#         venv_obj.last_used_at = timezone.now()
#         venv_obj.save()

#     try:
#         for job in test_jobs:
#             with transaction.atomic():
#                 log_file_path = os.path.join(os.path.dirname(__file__), "test_log.log")
#                 json_report_file_path = os.path.join(
#                     os.path.dirname(__file__), "result.json"
#                 )
#                 test_run_obj = job.test_run
#                 test_run_obj.status = "running"
#                 test_run_obj.modified_at = timezone.now()
#                 test_run_obj.log_file = log_file_path
#                 test_run_obj.save()

#                 print(f"Running test job {job.id} in venv {venv_name}")
#                 job.status = "running"
#                 job.save()

#                 # Compose the command
#                 full_script_path = os.path.join(
#                     venv_obj.path, "Lib", "site-packages", job.test_run.test_case.path
#                 )
#                 print(f"Full script path: {full_script_path}")

#                 if os.path.exists(full_script_path):
#                     cmd = f"pytest {full_script_path} --log-file={log_file_path} --json-report --json-report-file={json_report_file_path}"
#                     print(f"CMD is {cmd}")

#                     stdout, stderr, returncode = activate_venv(venv_obj.path, cmd)
#                     if returncode == 0:
#                         print("Command executed successfully.")
#                     else:
#                         print(f"Command failed with return code {returncode}")
#                         print(f"Error output: {stderr}")

#                     result = execute_script_in_venv(venv_obj.path, cmd.split())
#                     print(
#                         f"Result of the test run: {result}, return code: {result.returncode}"
#                     )

#                     if result.returncode == 0:
#                         update_status(job, test_run_obj, "completed")
#                     elif result.returncode < 0:
#                         update_status(
#                             job,
#                             test_run_obj,
#                             "aborted",
#                             result.stderr,
#                             result.returncode,
#                         )
#                     else:
#                         update_status(
#                             job,
#                             test_run_obj,
#                             "failed",
#                             result.stderr,
#                             result.returncode,
#                         )

#                 else:
#                     print(f"Test case path {full_script_path} does not exist.")
#                     update_status(
#                         job, test_run_obj, "failed", "Test case path does not exist", 1
#                     )

#                 handle_files(test_run_obj, log_file_path, json_report_file_path)

#                 print(f"Test job {job.id} completed in venv {venv_name}")

#     except Exception as e:
#         print(f"Exception while executing the test job: {e}")
#         for job in test_jobs:
#             update_status(job, job.test_run, "failed", str(e), 1)

#     finally:
#         print(f"Setting venv {venv_name} status to free")
#         venv_obj.status = "free"
#         venv_obj.last_used_at = timezone.now()
#         venv_obj.save()

#         if "e" in locals():
#             raise e


# ===========================================================================================


# 1. Helper to Update Status
def update_job_status(
    job, status, test_run_obj=None, error_stack=None, error_code=None
):
    job.status = status
    job.end_time = timezone.now()
    job.modified_at = timezone.now()
    job.save()

    if test_run_obj:
        test_run_obj.status = status
        test_run_obj.modified_at = timezone.now()
        if error_stack:
            test_run_obj.error_stack = error_stack
            test_run_obj.error_code = error_code
        test_run_obj.save()


# 2. Helper to Handle File Uploads and Parsing
def handle_file_uploads(test_run_obj, log_file_path, json_report_file_path):
    test_run_obj.log_file.save(
        os.path.basename(log_file_path), File(open(log_file_path, "rb"))
    )
    test_run_obj.report_file.save(
        os.path.basename(json_report_file_path),
        File(open(json_report_file_path, "rb")),
    )
    # Assuming parse_json_report function is defined elsewhere
    parse_json_report(json_report_file_path)


# 3. Install Controller Package
def install_controller_package(venv_obj, user, latest_ctrl_package_version):
    if venv_obj.ctrl_package_version is None:
        logging.info("Controller package is not installed. Installing it now...")
        # task_data = {
        #     "venv_name": venv_obj.venv_name,
        #     "user_id": str(user.id),
        #     "ctrl_package_version_id": latest_ctrl_package_version.repo_version,
        # }
        # task = copy_install_packages_to_venv_task.s(**task_data) | run_test_task.s(
        #     venv_obj.venv_name, user.id
        # )
        # task = copy_install_packages_to_venv_task.s(**task_data) | run_test_task.s()
        # task = copy_install_packages_to_venv_task.s(**task_data)
        # task.apply_async()
        return False
    return True


@shared_task(bind=True, max_retries=5, default_retry_delay=60)
def process_task_data(self, data):
    # Extract the required values from the data dictionary
    logger.info(f"Processing task data: {data}")
    venv_name = data.get("venv_name")
    user_id = data.get("user_id")
    try:
        user = get_user_model().objects.get(id=user_id)
        venv_obj = VirtualEnvironment.objects.get(venv_name=venv_name, user=user)
    except (get_user_model().DoesNotExist, VirtualEnvironment.DoesNotExist) as e:
        print(f"Error: {e}")
        return
    test_jobs = TestJob.objects.filter(venv=venv_obj, status="pending")
    # Call the next task with the correct parameters
    # return run_test_jobs.s(venv_name, user_id).apply_async()
    run_test_jobs(venv_obj, test_jobs)


# 4. Prepare and Run Test Jobs
# @shared_task(bind=True, max_retries=5, default_retry_delay=60)
def run_test_jobs(venv_obj, test_jobs):
    logger.info(f"Processing run_test_jobs data: {venv_obj, test_jobs}")

    for job in test_jobs:
        try:
            with transaction.atomic():
                logger.info(f"Got inside transaction.atomic() for job {job.id}")
                # log_file_path = os.path.join(os.path.dirname(__file__), "test_log.log")
                # json_report_file_path = os.path.join(
                #     os.path.dirname(__file__), "result.json"
                # )
                log_file_path = os.path.join(settings.LOGS_ROOT, "test_log.log")
                json_report_file_path = os.path.join(
                    os.path.dirname(__file__), "result.json"
                )
                test_run_obj = job.test_run

                # Set job status to running
                update_job_status(job, "running", test_run_obj)

                # Compose the test command
                tc_path = test_run_obj.test_case.path
                # C:/controller/cuw/test_script/linux/basic_ethernet_functionality/QA_Controller_56971.py
                logger.info(f"Test case path : {tc_path}")
                # script_path = os.path.join(
                #     venv_obj.path, "Lib", "site-packages", test_run_obj.test_case.path
                # )
                # cmd = f"pytest {tc_path} --log-file={log_file_path} --json-report --json-report-file={json_report_file_path}"
                # logger.info(f"Command to execute : {cmd}")
                result = execute_script_in_venv(
                    venv_obj.path, tc_path, log_file_path, json_report_file_path
                )
                if result.returncode == 0:
                    update_job_status(job, "completed", test_run_obj)
                else:
                    update_job_status(
                        job, "failed", test_run_obj, result.stderr, result.returncode
                    )

                handle_file_uploads(test_run_obj, log_file_path, json_report_file_path)

        except Exception as e:
            update_job_status(job, "failed", test_run_obj, str(e), 1)
            logging.error(f"Error executing job {job.id}: {e}")


# 5. Helper to Check Venv Availability
def ensure_venv_availability(venv_obj, test_jobs, self):
    while True:
        if venv_obj.status in ("free", "created") or not test_jobs.exists():
            venv_obj.status = "in-use"
            venv_obj.last_used_at = timezone.now()
            venv_obj.save()
            break
        elif venv_obj.status == "error":
            venv_obj.status = "in-use"
            venv_obj.ctrl_package_version = None
            venv_obj.last_used_at = timezone.now()
            venv_obj.save()
        else:
            logging.info(
                f"Venv {venv_obj.venv_name} is in use. Retrying in 60 seconds..."
            )
            self.retry(countdown=60)


# 6. Celery Task to Run Test Jobs
@shared_task(bind=True, max_retries=5, default_retry_delay=60)
# def run_test_task(self, venv_name, user_id):
def run_test_task(self, *args, **kwargs):
    # Perform test tasks
    logger.info(
        f"Running tests for venv: {kwargs.get('venv_name')} and user: {kwargs.get('user_id')}"
    )
    venv_name = kwargs.get("venv_name")
    user_id = kwargs.get("user_id")
    try:
        user = get_user_model().objects.get(id=int(user_id))
        venv_obj = VirtualEnvironment.objects.get(venv_name=venv_name, user=user)
        test_jobs = TestJob.objects.filter(venv=venv_obj, status="pending")

        # Ensure venv availability before proceeding
        ensure_venv_availability(venv_obj, test_jobs, self)

        logger.info(
            f"Virtual env ctrl package : {venv_obj.ctrl_package_version}, venv status : {venv_obj.status}"
        )

        # if not install_controller_package(venv_obj, user, latest_ctrl_package_version):
        if venv_obj.ctrl_package_version is None:
            # Call create_venv_task and wait for it to complete
            # Install controller package if necessary
            latest_ctrl_package_version = get_latest_ctrl_repo_version()
            task_data = {
                "venv_name": venv_obj.venv_name,
                "user_id": str(user.id),
                "ctrl_package_version_id": latest_ctrl_package_version.repo_version,
            }
            task = (
                copy_install_packages_to_venv_task.s(**task_data)
                | process_task_data.s()
            )
            task.apply_async()
            logger.info(f"Controller package installation task initiated: {task}")
        else:
            task_data = {"venv_name": venv_name, "user_id": user_id}
            process_task_data(task_data)
        logger.info("Controller package installation done, calling run_test_jobs")

    except Exception as e:
        logging.error(f"Error in run_test_job task: {e}")
        venv_obj.status = "error"
        venv_obj.last_used_at = timezone.now()
        venv_obj.save()

    finally:
        logging.info(f"Setting venv {venv_name} status to free")
        venv_obj.status = "free"
        venv_obj.last_used_at = timezone.now()
        venv_obj.save()


# ===========================================================================================


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
