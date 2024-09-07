import json
import logging
import os
import subprocess
import uuid

import redis
from celery import shared_task
from celery.exceptions import Retry
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files import File
from django.db import transaction
from django.utils import timezone
from django_redis import get_redis_connection

from ..models import TestJob, VirtualEnvironment
from ..tasks.repo_jobs import get_latest_ctrl_repo_version
from ..tasks.venv_jobs import copy_install_packages_to_venv_task

logger = logging.getLogger(__name__)


"""
Venv -> TestJobs -> Run each test job
So Venv has all tests scheduled to run
Take all jobs and run them one by one
Once a test job completes, update the status of the job
Update the result of test runs and upload logs to FTP
Take next test job and run it.
Repeat until all jobs are completed
"""


def get_unique_folder_name(base_name="folder"):
    """
    Generates a unique folder name based on the given base name.

    Args:
        base_name (str, optional): The base name for the folder. Defaults to "folder".

    Returns:
        str: The unique folder name.
    """

    while True:
        unique_id = uuid.uuid4().hex[
            :8
        ]  # Generate a unique 8-character hexadecimal string
        folder_name = f"{base_name}_{unique_id}"

        if not os.path.exists(folder_name):
            return folder_name


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
    return run_command(full_command)


def run_command(command):
    try:
        result = subprocess.run(
            command,
            # trunk-ignore(bandit/B603)
            shell=False,
            check=True,
            text=True,
            capture_output=False,
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
    logger.info(f"Uploading files for test run: {test_run_obj.id} - {test_run_obj}")
    logger.info(f"Log file path : {log_file_path}")
    logger.info(f"Json report file path : {json_report_file_path}")

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
        return False
    logging.info("Controller package is installed. Proceeding with test runs...")
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
    run_test_jobs(venv_obj, test_jobs, user_id)


# 4. Prepare and Run Test Jobs
def run_test_jobs(venv_obj, test_jobs, user_id):
    logger.info(f"Processing run_test_jobs data: {venv_obj, test_jobs}")

    for job in test_jobs:
        try:
            with transaction.atomic():
                logger.info(f"Got inside transaction.atomic() for job {job.id}")
                _unique_id = get_unique_folder_name(f"test_job_{job.id}_logs")
                log_file_path = os.path.join(
                    settings.LOGS_ROOT,
                    str(user_id),
                    _unique_id,
                    f"test_log_{_unique_id}.log",
                )
                json_report_file_path = os.path.join(
                    settings.LOGS_ROOT,
                    str(user_id),
                    _unique_id,
                    f"result_{_unique_id}.json",
                )
                logger.info(f"Log file path : {log_file_path}")
                logger.info(f"Json report file path : {json_report_file_path}")
                test_run_obj = job.test_run
                test_run_obj.test_job = job
                logger.info(f">>>> Test run object : {test_run_obj}")

                # Set job status to running
                update_job_status(job, "running", test_run_obj)

                # Compose the test command
                tc_path = test_run_obj.test_case.path
                logger.info(f"Test case path : {tc_path}")
                result = execute_script_in_venv(
                    venv_obj.path, tc_path, log_file_path, json_report_file_path
                )
                if result.returncode == 0:
                    update_job_status(job, "completed", test_run_obj)
                else:
                    update_job_status(
                        job, "failed", test_run_obj, result.stderr, result.returncode
                    )
                # handle_file_uploads(test_run_obj, log_file_path, json_report_file_path)

        except Exception as e:
            update_job_status(job, "failed", test_run_obj, str(e), 1)
            logging.error(f"Error executing job {job.id}: {e}")
        finally:
            handle_file_uploads(test_run_obj, log_file_path, json_report_file_path)


# 5. Helper to Check Venv Availability
# def ensure_venv_availability(venv_obj, test_jobs, self):
#     while True:
#         if venv_obj.status in ("free", "created") or not test_jobs.exists():
#             venv_obj.status = "in-use"
#             venv_obj.last_used_at = timezone.now()
#             venv_obj.save()
#             break
#         elif venv_obj.status == "error":
#             venv_obj.status = "in-use"
#             venv_obj.ctrl_package_version = None
#             venv_obj.last_used_at = timezone.now()
#             venv_obj.save()
#         else:
#             logging.info(
#                 f"Venv {venv_obj.venv_name} is in {venv_obj.status}. Retrying in 60 seconds..."
#             )
#             self.retry(countdown=60)


# def ensure_venv_availability(venv_obj, test_jobs, self):
def ensure_venv_availability(venv_obj, self):
    # lock_name = f"venv_lock_{venv_obj.venv_name}"  # Unique lock name for each venv
    # Try to acquire a Redis lock to prevent multiple workers from processing the same venv
    # lock = redis_conn.lock(lock_name, timeout=600)  # Lock expires after 10 minutes
    # redis_conn = get_redis_connection("default")
    # lock = redis_conn.lock(lock_name, timeout=300)  # Timeout after 5 minutes

    # redis_conn = get_redis_connection("default")
    # task_key = f"run_test_task_{venv_obj.venv_name}_{venv_obj.user.id}"
    # lock = redis_conn.lock(task_key, timeout=1)  # Timeout after 5 minutes

    # # if not lock.acquire(blocking=False):
    # #     # If the lock is already held, we skip this task
    # #     logger.info(f"Task {task_key} is already running.")
    # #     return

    # try:
    #     # Blocking=True makes it wait until the lock is available
    #     if lock.acquire(blocking=True):
    while True:
        if venv_obj.status in ("free", "created"):  # or not test_jobs.exists():
            venv_obj.status = "in-use"
            venv_obj.last_used_at = timezone.now()
            venv_obj.save()
            logging.info(f"Venv {venv_obj.venv_name} is now in use.")
            break

        elif venv_obj.status == "error":
            logging.info(f"Venv {venv_obj.venv_name} is in error state. Resetting...")
            venv_obj.status = "in-use"
            venv_obj.ctrl_package_version = None
            venv_obj.last_used_at = timezone.now()
            venv_obj.save()
            break

        else:
            logging.info(
                f"Venv {venv_obj.venv_name} is currently {venv_obj.status}. Retrying in 60 seconds..."
            )
            self.retry(countdown=60)  # Will retry after 60 seconds
    # finally:
    #     lock.release()  # Always release the lock when done


# 6. Celery Task to Run Test Jobs
# @shared_task(
# bind=True)
# bind=True, max_retries=5, default_retry_delay=60, rate_limit="10/m"
# Limit to 10 tasks per minute
# def run_test_task(self, venv_name, user_id):


# max_retries=None : ie try forever
@shared_task(bind=True, max_retries=None, default_retry_delay=60, acks_late=False)
def run_test_task(self, *args, **kwargs):
    # Perform test tasks
    # Use Redis-based distributed lock
    # redis_conn = get_redis_connection("default")
    # task_key = f"run_test_task_{kwargs['venv_name']}_{kwargs['user_id']}"
    # lock = redis_conn.lock(task_key, timeout=1)  # Timeout after 5 minutes

    # if not lock.acquire(blocking=False):
    #     # If the lock is already held, we skip this task
    #     logger.info(f"Task {task_key} is already running.")
    #     return

    logger.info(
        f"Running tests for venv: {kwargs.get('venv_name')} and user: {kwargs.get('user_id')}"
    )
    venv_name = kwargs.get("venv_name")
    user_id = kwargs.get("user_id")
    try:
        user = get_user_model().objects.get(id=int(user_id))
        venv_obj = VirtualEnvironment.objects.get(venv_name=venv_name, user=user)
        # test_jobs = TestJob.objects.filter(venv=venv_obj, status="pending")

        # Ensure venv availability before proceeding
        # ensure_venv_availability(venv_obj, test_jobs, self)
        ensure_venv_availability(venv_obj, self)

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
            logger.info("Controller package installation found, calling run_test_jobs")
            process_task_data(task_data)
    except Retry:
        # Re-raise the Retry exception
        logging.info(
            f"Venv {venv_name} status is {venv_obj.status}. Retrying the task..."
        )
        raise
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
        # try:
        #     lock.release()  # Release the lock after the task completes
        # except redis.exceptions.LockNotOwnedError:
        #     pass


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
