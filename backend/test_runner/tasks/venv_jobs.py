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
from django.contrib.auth import get_user_model
import shutil
from django.db import transaction
from stat import S_IRWXU
from django.core.files import File
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from ..models import VirtualEnvironment, CtrlPackageRepo, Config

logger = logging.getLogger(__name__)
python_executable = sys.executable


def sanitize_venv_name(name):
    if not name:  # or `if name is None:`
        raise ValueError("venv_name cannot be None")
    if re.match(r"^[\w-]+$", name):
        return name
    else:
        return re.sub(r"[^\w-]", "-", name)


def create_virtualenv(venv_path, python_executable):
    try:
        logger.info(
            f"Creating virtual environment at {venv_path} using {python_executable}"
        )
        result = subprocess.run(
            [python_executable, "-m", "venv", venv_path],
            check=True,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            logger.error(f"Error creating virtual environment: {result.stderr}")
            return False, result.stderr
        return True, None
    except subprocess.CalledProcessError as e:
        logger.error(f"Subprocess error: {e.stderr}")
        return False, e.stderr


def save_files(obj, requirements_file, script_file):
    if requirements_file:
        obj.requirements.save("requirements.txt", ContentFile(requirements_file))
    if script_file:
        obj.script.save("script.py", ContentFile(script_file))


def assign_config_file(obj, config_file_id):
    if config_file_id:
        try:
            obj.config_file = Config.objects.get(id=int(config_file_id))
        except Config.DoesNotExist:
            logger.error(f"Config file with ID {config_file_id} does not exist.")
            return False
    return True


@shared_task
def create_venv(
    venv_name=None,
    python_version=None,
    nickname=None,
    user_id=None,
    requirements_file=None,
    script_file=None,
    config_file_id=None,
):
    user = get_user_model().objects.get(id=user_id)
    venv_name = sanitize_venv_name(venv_name)
    venv_path = os.path.join(settings.BASE_DIR, "venvs", str(user.id), venv_name)
    # python_executable = os.path.join(
    #     settings.BASE_DIR, "venvs", "python"
    # )  # Adjust as needed

    logger.info(f"Venv path is: {venv_path}")

    os.makedirs(venv_path, exist_ok=True)

    success, error_message = create_virtualenv(venv_path, python_executable)
    if not success:
        return f"Error creating virtual environment: {error_message}"

    with transaction.atomic():
        obj = VirtualEnvironment(
            user=user,
            venv_name=venv_name,
            path=venv_path,
            python_version=python_version,
            nickname=nickname,
            status="created",
            ctrl_package_version=CtrlPackageRepo.objects.get(id=int(config_file_id)),
        )
        obj.save()

        save_files(obj, requirements_file, script_file)

        if not assign_config_file(obj, config_file_id):
            return "Failed to assign config file."

        obj.save()
        logger.info(f"Venv object created: {obj}")

    return "Virtual environment created successfully."


def get_venv_status(venv_name):
    try:
        venv = VirtualEnvironment.objects.get(name=venv_name)
        return {
            "name": venv.venv_name,
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


def activate_venv(venv_path):
    logger.info(f"Ven path is {venv_path}")
    os.chmod(venv_path, S_IRWXU)
    executable_path = os.path.join(venv_path)
    logger.info(f"Executable path : {executable_path}")
    try:
        activate_script = os.path.join(executable_path, "Scripts", "activate.bat")
        logger.info(f"activate_script path : {activate_script}")
        result = subprocess.run([activate_script], shell=False, check=True, text=True)
    except FileNotFoundError:
        activate_script = os.path.join(venv_path, "bin", "activate")
        result = subprocess.run([activate_script], shell=False, check=True, text=True)

    op = result.stdout
    er = result.stderr
    logger.info(f"Virtual environment activated at {op}  -- error : {er}")
    return op


# def activate_venv(venv_path):
#     logger.info(f"Ven path is {venv_path}")
#     if sys.platform == "win32":
#         venv_bin = os.path.join(venv_path, "Scripts")
#     else:
#         venv_bin = os.path.join(venv_path, "bin")

#     # Adjust the PATH to include the venv's bin directory
#     # os.environ["PATH"] = venv_bin + os.pathsep + os.environ.get("PATH", "")
#     # os.environ["VIRTUAL_ENV"] = venv_path

#     # Ensure the correct Python executable is used
#     sys.executable = os.path.join(venv_bin, "python")

#     logger.info(f"Virtual environment activated at {venv_path}")


def deactivate_venv(venv_path):
    try:
        logger.info(f"Deactivating venv at path: {venv_path}")
        deactivate_script = os.path.join(venv_path, "Scripts", "deactivate.bat")

        # For Windows environments
        if os.name == "nt" and os.path.exists(deactivate_script):
            result = subprocess.run(
                [deactivate_script], shell=True, check=True, text=True
            )
        else:
            # For Unix-based environments
            deactivate_script = os.path.join(venv_path, "bin", "deactivate")
            result = subprocess.run(
                ["sh", "-c", f"source {deactivate_script}"],
                shell=False,
                check=True,
                text=True,
            )

        logger.info("Venv deactivated successfully.")
    except Exception as e:
        logger.error(f"Error deactivating venv: {e}")
    return result.stdout if result else None


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


# def copy_files(
#     ctrl_pkg_version="latest",
#     venv_path=None,
#     requirements_file=None,
#     script_file=None,
# ):
#     """
#     Copies the control package, requirements file, and script file to the specified virtual environment path.

#     Args:
#         ctrl_pkg_version (str): Version of the control package to copy. Defaults to "latest.zip".
#         venv_path (str): Path to the virtual environment where files will be copied.
#         requirements_file (str, optional): Path to the requirements.txt file to copy.
#         script_file (str, optional): Path to a user-provided script file to copy.

#     Raises:
#         ValueError: If `venv_path` is not provided.
#     """
#     if not venv_path:
#         raise ValueError("The virtual environment path (`venv_path`) must be provided.")

#     logger.info(f"Using virtual environment path: {venv_path}")

#     # Define the user files directory and create it if necessary
#     user_files_path = os.path.join(venv_path, "user_files")
#     os.makedirs(user_files_path, exist_ok=True)
#     logger.info(f"User files directory created at: {user_files_path}")

#     # Set appropriate permissions
#     os.chmod(user_files_path, 0o755)

#     logger.info(f"Latest Package : {ctrl_pkg_version}")

#     ctrl_pkg_src = os.path.join(settings.REPO_PATH, ctrl_pkg_version)
#     logger.info(f"Controller package found at : {ctrl_pkg_src}")

#     os.chmod(ctrl_pkg_src, 0o755)

#     # shutil.copy2(ctrl_pkg_src, user_files_path)
#     if os.path.isdir(ctrl_pkg_src):
#         shutil.copytree(
#             ctrl_pkg_src, os.path.join(user_files_path, os.path.basename(ctrl_pkg_src))
#         )
#     else:
#         shutil.copy2(ctrl_pkg_src, user_files_path)
#     logger.info(f"Control package '{ctrl_pkg_version}' copied to: {user_files_path}")

#     # Copy additional files if provided
#     for custom_file in (requirements_file, script_file):
#         if custom_file:
#             shutil.copy(custom_file, user_files_path)
#             logger.info(f"Copied custom file '{custom_file}' to: {user_files_path}")


def create_user_files_directory(venv_path):
    """
    Ensure the 'user_files' directory exists within the virtual environment path.

    Args:
        venv_path (str): The path to the virtual environment.

    Returns:
        str: The path to the 'user_files' directory.
    """
    logger.info(f"Creating user_files directory in virtual environment: {venv_path}")
    user_files_path = os.path.join(venv_path, "user_files")
    if not os.path.exists(user_files_path):
        os.makedirs(user_files_path, mode=0o755)
        logger.info(f"User_files directory created at: {user_files_path}")
    else:
        logger.info(f"User_files directory already exists at: {user_files_path}")
    return user_files_path


def copy_controller_package(ctrl_pkg_version, user_files_path):
    """
    Copy the control package to the user files directory.

    Args:
        ctrl_pkg_version (str): The control package version to copy.
        user_files_path (str): The path to the 'user_files' directory.
    """
    ctrl_pkg_src = os.path.join(settings.REPO_ROOT, ctrl_pkg_version)
    logger.info(
        f"Copying controller package to user files directory : {ctrl_pkg_version} and {user_files_path}"
    )

    if os.path.exists(ctrl_pkg_src):
        if os.path.isfile(ctrl_pkg_src):
            shutil.copy2(ctrl_pkg_src, user_files_path)
            logger.info(
                f"Control package '{ctrl_pkg_version}' copied to: {user_files_path}"
            )
        else:
            shutil.copytree(ctrl_pkg_src, user_files_path, dirs_exist_ok=True)
            logger.info(
                f"Control package directory '{ctrl_pkg_version}' copied to: {user_files_path}"
            )
    else:
        logger.error(f"Control package source '{ctrl_pkg_src}' does not exist")


def copy_custom_files(custom_files, user_files_path):
    """
    Copy custom files (requirements and scripts) to the user files directory.

    Args:
        custom_files (list): List of file paths to copy.
        user_files_path (str): The path to the 'user_files' directory.
    """
    logger.info(
        f"Copying custom files to user files directory : {custom_files} and {user_files_path}"
    )
    for file in filter(None, custom_files):
        if os.path.exists(file):
            shutil.copy(file, user_files_path)
            logger.info(f"Custom file '{file}' copied to: {user_files_path}")
        else:
            logger.error(f"Custom file '{file}' does not exist")


def copy_files(ctrl_pkg_version, venv_path, requirements_file=None, script_file=None):
    """
    Main function to copy the control package and optional custom files
    (requirements and scripts) to the specified virtual environment.

    Args:
        ctrl_pkg_version (str): The control package version to copy.
        venv_path (str): The path to the virtual environment.
        requirements_file (str, optional): The path to the requirements file.
        script_file (str, optional): The path to the script file.
    """
    if ctrl_pkg_version is None:
        ctrl_pkg_version = "latest.zip"

    logger.info(f"Venv path is : {venv_path}")

    # Create user files directory
    user_files_path = create_user_files_directory(venv_path)

    # Copy control package
    copy_controller_package(ctrl_pkg_version, user_files_path)

    # Copy custom files
    custom_files = [requirements_file, script_file]
    copy_custom_files(custom_files, user_files_path)


def install_packages(venv_path, requirements_file_name):
    install_ctrl_packages(venv_path)
    install_requirements(venv_path, requirements_file_name)


def install_requirements(venv_path, requirements_file_name):
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


def find_files(directory, pattern):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if pattern in file:
                # print(os.path.join(root, file))
                return os.path.join(root, file)


def install_ctrl_packages(venv_path, ctrl_lib=True, ctrl_test=True):
    # Install from the user_files folder
    logger.info(f"Venv path is : {venv_path}")
    user_file_path = os.path.join(venv_path, "user_files")
    ctrl_lib_path = None
    ctrl_test_path = None
    if ctrl_lib:
        ctrl_lib_path = find_files(user_file_path, "automation-lib")
    if ctrl_test:
        ctrl_test_path = find_files(user_file_path, "automation-tests")
    logger.info(f"Ctrl_Lib file name is : {ctrl_lib}")
    logger.info(f"Ctrl_Lib file name is : {ctrl_test}")
    pip_executable = os.path.join(venv_path, "Scripts", "python")
    logger.info(f"Pip executable is : {pip_executable}")
    # find requirements file
    results = []
    for pkg in [ctrl_lib_path, ctrl_test_path]:
        if pkg:
            # pkg_path = os.path.join(venv_path, "user_files", pkg)
            logger.info(f"ctrl_lib file path is : {pkg}")
            result = subprocess.run(
                [
                    venv_path + "\\Scripts\\python",
                    "-m",
                    "pip",
                    "install",
                    pkg,
                ],
                check=True,
                text=True,
                shell=False,
            )

            results.append(result.stdout)
    # install ctrl, lib repositories

    return results


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
    # ctrl_pkg_version = kwargs.get("ctrl_package_version")
    # venv_obj = get_object_or_404(VirtualEnvironment, name=venv_name, user=user)
    venv_obj = get_object_or_404(VirtualEnvironment, venv_name=venv_name, user=user)
    logger.info(f"Venv object is {venv_obj}")

    # Copy the control package to the user files directory
    # if ctrl_pkg_version == "latest":
    #     versions = CtrlPackageRepo.objects.get(id=1)
    #     ctrl_pkg_version = versions.repo_versions[0]  # get the first item
    # logger.info(f"Control package version is : {ctrl_pkg_version}")

    # Start the VENV
    # venv_path = activate_venv(venv_name, venv_obj.path)
    venv_path = activate_venv(venv_obj.path)
    logger.info(f"Venv activated : {venv_path}")

    # Change Virtual Env status to in-use
    venv_obj.status = "in-use"
    venv_obj.assigned_at = timezone.now()
    venv_obj.last_used_at = timezone.now()
    # venv_obj.ctrl_package_version = ctrl_pkg_version
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
        venv_obj.ctrl_package_version.repo_version,
        venv_obj.path,
        requirements_file_path,
        script_file_path,
    )
    logger.info("All files copied successfully, installing packages now")

    # Install the requirements
    requirements_file_name = os.path.basename(venv_obj.requirements.name)
    result = install_packages(venv_obj.path, requirements_file_name)
    logger.info(f"Requirements installed : {result}")
