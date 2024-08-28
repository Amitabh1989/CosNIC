import logging
import os
import re
import subprocess
import sys

from celery import shared_task
from django.conf import settings
from django.contrib.auth.models import User

from ..models import VirtualEnvironment

logger = logging.getLogger(__name__)
python_executable = sys.executable


def sanitize_venv_name(name):
    if not name:  # or `if name is None:`
        raise ValueError("venv_name cannot be None")
    if re.match(r"^[\w-]+$", name):
        return name
    else:
        return re.sub(r"[^\w-]", "-", name)


@shared_task
def create_venv(venv_name="heya", version="3.9", nickname="", **kwargs):
    venv_name = sanitize_venv_name(venv_name)  # Sanitize the venv_name
    venv_path = os.path.join(settings.BASE_DIR, "venvs", venv_name)
    logger.info(f"Inside celery task : Venv path is : {venv_path}")
    user = User.objects.get(id=kwargs.get("user"))

    # Ensure the directory exists
    os.makedirs(venv_path, exist_ok=True)

    logger.info(f"Python executable before : {python_executable}")

    try:
        logger.info(
            f"Executing venv creation with python executable : {python_executable}"
        )
        result = subprocess.run(
            [python_executable, "-m", "venv", venv_path],
            check=True,
            capture_output=True,
            text=True,
            shell=False,
        )
        logger.info(f"Venv created successfully : {result}")

        # # Get the currently logged-in user (requires authentication)
        # user = get_user_model().objects.get(username=self.request.user.username)
        logger.info(f"User is {kwargs.get('user')}")
        obj = VirtualEnvironment.objects.create(
            user=user,
            name=venv_name,
            path=venv_path,
            python_version=version,
            nickname=nickname,
        )
        logger.info(f"Venv object created : {obj}")
        return "Virtual environment created successfully."
    except subprocess.CalledProcessError as e:
        logger.info("Error:", e)
        logger.info("stdout:", e.stdout)
        logger.info("stderr:", e.stderr)
        return str(e)


def get_venv_status(venv_name):
    try:
        venv = VirtualEnvironment.objects.get(name=venv_name)
        return {
            "name": venv.name,
            "created_at": venv.created_at,
            "status": venv.status,
            "path": venv.path,
            "nickname": venv.nickname,
            "python_version": venv.python_version,
        }
    except VirtualEnvironment.DoesNotExist:
        return None


def update_venv_status(venv_name, status):
    try:
        venv = VirtualEnvironment.objects.get(name=venv_name)
        venv.status = status
        venv.save()
        return True
    except VirtualEnvironment.DoesNotExist:
        return False


def list_all_venvs():
    return VirtualEnvironment.objects.all().values(
        "name", "created_at", "status", "nickname", "python_version"
    )


def start_venv(venv_name):
    venv_path = os.path.join(settings.BASE_DIR, "venvs", venv_name, "bin", "python")
    return venv_path


def copy_packages_to_venv(venv_name):
    venv_path = os.path.join(settings.BASE_DIR, "venvs", venv_name, "bin", "python")
    result = subprocess.run(
        [venv_path, "-m", "pip", "install", "-r", "requirements.txt"],
        capture_output=True,
        text=True,
    )
    return result
