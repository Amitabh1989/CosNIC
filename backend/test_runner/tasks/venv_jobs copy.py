import logging
import os
import re
import subprocess
import sys
from django.shortcuts import get_object_or_404
from celery import shared_task
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone
import shutil
from stat import S_IRWXU

from ..models import VirtualEnvironment, CtrlPackageRepo

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
    user = User.objects.get(id=kwargs.get("user"))
    venv_name = sanitize_venv_name(venv_name)  # Sanitize the venv_name
    venv_path = os.path.join(settings.BASE_DIR, "venvs", str(user.id), venv_name)
    logger.info(f"Inside celery task : Venv path is : {venv_path}")

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
            status="created",
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


def update_venv_status(venv_name, status, user_id):
    try:
        user = User.objects.get(id=user_id)
        venv = VirtualEnvironment.objects.get(name=venv_name, user=user)
        venv.status = status
        venv.save()
        return True
    except VirtualEnvironment.DoesNotExist:
        return False


def list_all_venvs():
    return VirtualEnvironment.objects.all().values(
        "name", "created_at", "status", "nickname", "python_version"
    )


def list_user_venvs(user):
    return VirtualEnvironment.objects.filter(user=user).values(
        "name", "created_at", "status", "nickname", "python_version"
    )


def activate_venv(venv_name, venv_path):
    logger.info(f"Ven path is {venv_path}")
    os.chmod(venv_path, S_IRWXU)
    executable_path = os.path.join(venv_path)
    logger.info(f"Executable path : {executable_path}")
    try:
        activate_script = os.path.join(executable_path, "Scripts", "activate.bat")
        result = subprocess.run([activate_script], shell=False, check=True, text=True)
    except FileNotFoundError:
        activate_script = os.path.join(venv_path, "bin", "activate")
        result = subprocess.run([activate_script], shell=False, check=True, text=True)
    return result.stdout


# def copy_files(ctrl_pkg_version, venv_path, requirements_file=None, script_file=None):
#     if ctrl_pkg_version is None:
#         ctrl_pkg_version = "latest.zip"

#     logger.info(f"Venv path is : {venv_path}")
#     # Check or create user_files folder inside the venv
#     os.makedirs(os.path.join(venv_path, "user_files"), exist_ok=True)

#     user_files_path = os.path.join(venv_path, "user_files")
#     logger.info(f"User_files path is : {user_files_path}")
#     os.chmod(user_files_path, 0o755)

#     # ctrl and lib package
#     src = os.path.join(settings.REPO_PATH, ctrl_pkg_version)
#     dest = os.path.join(user_files_path)
#     shutil.copy2(src, dest)

#     # Copy requirement.txt and scripts
#     custom_files = []
#     if requirements_file:
#         custom_files.append(requirements_file)
#     if script_file:
#         custom_files.append(script_file)

#     if custom_files:
#         for file in custom_files:
#             dest = os.path.join(user_files_path)
#             shutil.copy(file, dest)


def copy_files(
    ctrl_pkg_version="latest",
    venv_path=None,
    requirements_file=None,
    script_file=None,
):
    """
    Copies the control package, requirements file, and script file to the specified virtual environment path.

    Args:
        ctrl_pkg_version (str): Version of the control package to copy. Defaults to "latest.zip".
        venv_path (str): Path to the virtual environment where files will be copied.
        requirements_file (str, optional): Path to the requirements.txt file to copy.
        script_file (str, optional): Path to a user-provided script file to copy.

    Raises:
        ValueError: If `venv_path` is not provided.
    """
    if not venv_path:
        raise ValueError("The virtual environment path (`venv_path`) must be provided.")

    logger.info(f"Using virtual environment path: {venv_path}")

    # Define the user files directory and create it if necessary
    user_files_path = os.path.join(venv_path, "user_files")
    os.makedirs(user_files_path, exist_ok=True)
    logger.info(f"User files directory created at: {user_files_path}")

    # Set appropriate permissions
    os.chmod(user_files_path, 0o755)

    logger.info(f"Latest Package : {ctrl_pkg_version}")

    ctrl_pkg_src = os.path.join(settings.REPO_PATH, ctrl_pkg_version)
    logger.info(f"Controller package found at : {ctrl_pkg_src}")

    os.chmod(ctrl_pkg_src, 0o755)

    # shutil.copy2(ctrl_pkg_src, user_files_path)
    if os.path.isdir(ctrl_pkg_src):
        shutil.copytree(
            ctrl_pkg_src, os.path.join(user_files_path, os.path.basename(ctrl_pkg_src))
        )
    else:
        shutil.copy2(ctrl_pkg_src, user_files_path)
    logger.info(f"Control package '{ctrl_pkg_version}' copied to: {user_files_path}")

    # Copy additional files if provided
    for custom_file in (requirements_file, script_file):
        if custom_file:
            shutil.copy(custom_file, user_files_path)
            logger.info(f"Copied custom file '{custom_file}' to: {user_files_path}")


def install_packages(venv_path, requirements_file_name, ctrl_lib=None, ctrl_test=None):
    # Install from the user_files folder
    logger.info(f"Venv path is : {venv_path}")
    logger.info(f"Requirements file name is : {requirements_file_name}")
    pip_executable = os.path.join(venv_path, "Scripts", "python")
    logger.info(f"Pip executable is : {pip_executable}")
    # find requirements file
    requirements_file = os.path.join(venv_path, "user_files", requirements_file_name)
    logger.info(f"Requirements file path is : {requirements_file}")
    result = subprocess.run(
        [
            venv_path + "\\Scripts\\python",
            "-m",
            "pip",
            "install",
            "-r",
            requirements_file,
        ],
        check=True,
        text=True,
        shell=False,
    )

    # install ctrl, lib repositories

    return result.stdout


def check_valid_venv(venv_name, user):
    try:
        venv = VirtualEnvironment.objects.get(name=venv_name, user=user)
        return venv
    except VirtualEnvironment.DoesNotExist:
        return False


@shared_task
def copy_install_packages_to_venv(**kwargs):
    """
    Here, we copy and install the packages from the requirements.txt file to the virtual environment.
    We also copy the package version from server to the venv and install it.
    Install all the packages needed for the virtual environment.

    This must receive the user object so that these details can be fetched from foreign relationship.

    Args:
        venv_name (_type_): _description_

    Returns:
        _type_: _description_
    """
    user = User.objects.get(id=kwargs.get("user"))
    venv_name = kwargs.get("venv_name")
    ctrl_pkg_version = kwargs.get("ctrl_package_version")
    # venv_obj = get_object_or_404(VirtualEnvironment, name=venv_name, user=user)
    venv_obj = get_object_or_404(VirtualEnvironment, name=venv_name, user=user)
    logger.info(f"Venv object is {venv_obj}")

    # Copy the control package to the user files directory
    if ctrl_pkg_version == "latest":
        versions = CtrlPackageRepo.objects.get(id=1)
        ctrl_pkg_version = versions.repo_versions[0]  # get the first item

    # In case we have multiple names. But since venv_name is unique, we can use it directly.
    # venvs = VirtualEnvironment.objects.filter(user=user, name=venv_name)
    # Using reverse relationship : user.venv.filter(name=venv_name)

    # Start the VENV
    venv_path = activate_venv(venv_name, venv_obj.path)
    logger.info(f"Venv activated : {venv_path}")

    # Change Virtual Env status to in-use
    venv_obj.status = "in-use"
    venv_obj.assigned_at = timezone.now()
    venv_obj.last_used_at = timezone.now()
    venv_obj.ctrl_package_version = ctrl_pkg_version
    venv_obj.save()

    # Copy the requirements file, controller package
    # Check if the requirements file exists
    if venv_obj.requirements:
        requirements_file_path = os.path.join(venv_obj.requirements.path)
    else:
        requirements_file_path = None  # or handle it as needed
    logger.info(f"Requirements file is : {requirements_file_path}")

    # Check if the script file exists
    if venv_obj.script:
        script_file_path = os.path.join(venv_obj.script.path)
    else:
        script_file_path = None  # or handle it as needed
    logger.info(f"Scripts file is : {script_file_path}")

    copy_files(
        venv_obj.ctrl_package_version,
        venv_obj.path,
        requirements_file_path,
        script_file_path,
    )
    logger.info("All files copied successfully, installing packages now")
    # Install the requirements
    requirements_file_name = os.path.basename(venv_obj.requirements.name)
    result = install_packages(venv_obj.path, requirements_file_name)
    logger.info(f"Requirements installed : {result}")
    # Install the controller package
    # venv_path = os.path.join(settings.BASE_DIR, "venvs", venv_name, "bin", "python")
    # result = subprocess.run(
    #     [venv_path, "-m", "pip", "install", "-r", "requirements.txt"],
    #     capture_output=True,
    #     text=True,
    # )
    # return result
