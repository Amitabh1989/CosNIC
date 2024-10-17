import logging
import os
import re
import shutil
import stat
import subprocess
import sys
from stat import S_IRWXU
from typing import Optional

import yaml
from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.files import File
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from ..models import Config, CtrlPackageRepo, VirtualEnvironment
from ..tasks.repo_jobs import get_latest_ctrl_repo_version

logger = logging.getLogger(__name__)
python_executable = sys.executable


def sanitize_venv_name(name):
    if not name:  # or `if name is None:`
        raise ValueError("venv_name cannot be None")
    if re.match(r"^[\w-]+$", name):
        return name
    else:
        return re.sub(r"[^\w-]", "-", name)


def create_virtualenv(
    venv_path, python_executable=None
):  # use the default Python executable on the server
    try:
        logger.info(
            f"Creating virtual environment at {venv_path} using Python version {python_executable}"
            # Creating virtual environment at C:\GitHub\CosNIC\backend\venvs\1\alpha_34 using Python version 3.9
        )
        # Ensure the correct permissions are set (e.g., read/write/execute)
        for root, dirs, files in os.walk(venv_path):
            for dir in dirs:
                os.chmod(
                    os.path.join(root, dir), stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO
                )
            for file in files:
                os.chmod(
                    os.path.join(root, file), stat.S_IRUSR | stat.S_IWUSR | stat.S_IXUSR
                )
        # Try creating the virtual environment
        python_executable = sys.executable
        logger.info(f"Using Python executable at: {python_executable}")
        os.chmod(venv_path, S_IRWXU)
        os.chmod(python_executable, S_IRWXU)

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


# @shared_task(bind=True)
# def create_venv_task(
#     self,
#     venv_name=None,
#     python_version=None,
#     nickname=None,
#     user_id=None,
#     requirements_file=None,
#     script_file=None,
#     config_file_id=None,
#     ctrl_package_version_id="latest",
# ):
#     print(
#         f"Received arguments: venv_name={venv_name}, python_version={python_version}, nickname={nickname}, user_id={user_id}"
#     )

#     try:
#         user = get_user_model().objects.get(id=user_id)
#         venv_name = sanitize_venv_name(venv_name)
#         venv_path = os.path.join(settings.BASE_DIR, "venvs", str(user.id), venv_name)

#         logger.info(f"Venv path is: {venv_path}")

#         try:
#             os.makedirs(venv_path, exist_ok=True)
#         except OSError as e:
#             os.chmod(
#                 venv_path, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO
#             )  # Full permissions
#             os.makedirs(venv_path, exist_ok=True)

#         success, error_message = create_virtualenv(venv_path, python_executable)
#         if not success:
#             return f"Error creating virtual environment: {error_message}"

#         if ctrl_package_version_id == "latest":
#             # Ensure that the CtrlPackageRepo model is ordered by 'repo_version' if you want to get the latest
#             ctrl_package_version_obj = CtrlPackageRepo.objects.latest("repo_version")
#             # ctrl_package_version = ctrl_package_version_obj.repo_version
#         else:
#             try:
#                 ctrl_package_version_obj = CtrlPackageRepo.objects.get(
#                     id=int(ctrl_package_version_id)
#                 )
#                 # ctrl_package_version = ctrl_package_version_obj.repo_version
#             except CtrlPackageRepo.DoesNotExist:
#                 logger.error(
#                     f"CtrlPackageRepo with repo_version {ctrl_package_version_id} does not exist."
#                 )
#                 ctrl_package_version_obj = None

#         # Handle nickname if it's empty
#         if not nickname or nickname.strip() == "":
#             nickname = f'{venv_name}_{timezone.now().strftime("%Y-%m-%d-%H%M%S")}'
#         else:
#             nickname = f'{nickname}_{timezone.now().strftime("%Y-%m-%d-%H%M%S")}'

#         with transaction.atomic():
#             obj = VirtualEnvironment(
#                 user=user,
#                 venv_name=venv_name,
#                 path=venv_path,
#                 python_version=python_version,
#                 nickname=nickname,
#                 status="created",
#             )
#             logger.info(f"Ctrl package version object: {ctrl_package_version_obj}")
#             if ctrl_package_version_obj:
#                 obj.ctrl_package_version = ctrl_package_version_obj
#             obj.save()

#             save_files(obj, requirements_file, script_file)

#             if not assign_config_file(obj, config_file_id):
#                 return "Failed to assign config file."

#             obj.save()
#             logger.info(f"Venv object created: {obj}")

#         return "Virtual environment created successfully."
#     except Exception as e:
#         try:
#             # Clean up by deleting the created folder
#             if os.path.exists(venv_path):
#                 shutil.rmtree(venv_path)
#                 logger.info(f"Virtual environment directory removed: {venv_path}")
#         except Exception as e:
#             logger.error(f"Error removing virtual environment directory: {e}")
#         logger.error(f"Error creating virtual environment '{venv_name}': {e}")
#         # raise self.retry(exc=exc, countdown=60)  # Retry after 60 seconds
#         raise e


@shared_task(bind=True)
def create_venv_task(
    self,
    venv_name: Optional[str] = None,
    python_version: Optional[str] = None,
    nickname: Optional[str] = None,
    user_id: Optional[int] = None,
    requirements_file: Optional[str] = None,
    script_file: Optional[str] = None,
    config_file_id: Optional[int] = None,
    ctrl_package_version_id: str = "latest",
) -> str:
    """
    Creates a new virtual environment and assigns necessary files and configurations.

    Args:
        venv_name (Optional[str]): The name of the virtual environment.
        python_version (Optional[str]): The Python version to use for the virtual environment.
        nickname (Optional[str]): An optional nickname for the virtual environment.
        user_id (Optional[int]): The ID of the user creating the virtual environment.
        requirements_file (Optional[str]): Path to the requirements file to be used.
        script_file (Optional[str]): Path to the script file to be used.
        config_file_id (Optional[int]): ID of the configuration file to be assigned.
        ctrl_package_version_id (str): Version ID of the CtrlPackageRepo. Defaults to "latest".

    Returns:
        str: Success or error message.
    """
    logger.info(
        f"Received arguments: venv_name={venv_name}, python_version={python_version}, "
        f"nickname={nickname}, user_id={user_id}"
    )

    try:
        user = get_user_model().objects.get(id=user_id)
        # venv_name = sanitize_venv_name(venv_name)
        print(f"Venv name is : {venv_name}")
        venv_path = os.path.join(settings.BASE_DIR, "venvs", str(user.id), venv_name)

        logger.info(f"Venv path is: {venv_path}")

        # Create the virtual environment directory
        os.makedirs(venv_path, exist_ok=True)

        # Set permissions if directory already exists
        if not os.path.exists(venv_path):
            os.chmod(
                venv_path, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO
            )  # Full permissions
            os.makedirs(venv_path, exist_ok=True)

        logger.info(f">>>>> Python venv_path is : {venv_path}\n\n\n")

        # Create virtual environment
        success, error_message = create_virtualenv(venv_path, python_version)
        if not success:
            return f"Error creating virtual environment: {error_message}"

        # Fetch CtrlPackageRepo object
        ctrl_package_version_obj = get_latest_ctrl_repo_version()
        if str(ctrl_package_version_id) != "latest":
            try:
                ctrl_package_version_obj = CtrlPackageRepo.objects.get(
                    id=int(ctrl_package_version_id)
                )
            except CtrlPackageRepo.DoesNotExist:
                logger.error(
                    f"CtrlPackageRepo with repo_version {ctrl_package_version_id} does not exist."
                )
            finally:
                print(
                    f"Ctrl package version object: {ctrl_package_version_obj} and version {ctrl_package_version_obj.repo_version}"
                )

        # Handle nickname
        # if not nickname or nickname.strip() == "":
        #     nickname = f'{venv_name}_{timezone.now().strftime("%Y-%m-%d-%H%M%S")}'
        # else:
        #     nickname = f'{nickname}_{timezone.now().strftime("%Y-%m-%d-%H%M%S")}'

        # Create VirtualEnvironment object
        with transaction.atomic():
            obj = VirtualEnvironment.objects.get_or_create(
                user=user,
                venv_name=venv_name,
                path=venv_path,
                python_version=python_version,
                nickname=nickname,
                status="created",
            )
            if ctrl_package_version_obj:
                obj.ctrl_package_version = ctrl_package_version_obj
            obj.save()

            save_files(obj, requirements_file, script_file)

            if not assign_config_file(obj, config_file_id):
                return "Failed to assign config file."

            obj.save()
            logger.info(f"Venv object created: {obj}")

        return "Virtual environment created successfully."

    except Exception as e:
        try:
            # Clean up by deleting the created folder
            if os.path.exists(venv_path):
                shutil.rmtree(venv_path)
                logger.info(f"Virtual environment directory removed: {venv_path}")
        except Exception as cleanup_error:
            logger.error(
                f"Error removing virtual environment directory: {cleanup_error}"
            )

        logger.error(f"Error creating virtual environment '{venv_name}': {e}")
        raise e  # Optionally, you could use self.retry(exc=e, countdown=60) to ret


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


# def install_ctrl_package_in_venv(venv_path: str, package_path: str) -> None:
#     """
#     Install the controller package in the specified virtual environment.

#     Args:
#         venv_path (str): Path to the virtual environment.
#         package_path (str): Path to the controller package to be installed.
#     """
#     # Determine the path to pip in the virtual environment
#     if os.name == "nt":
#         pip_path = os.path.join(venv_path, "Scripts", "pip.exe")
#     else:
#         pip_path = os.path.join(venv_path, "bin", "pip")

#     # Construct the command
#     cmd = [pip_path, "install", package_path]
#     print(f"Installing controller package with command: {' '.join(cmd)}")

#     # Execute the command
#     result = subprocess.run(cmd, text=True, capture_output=True)
#     print(f"Controller package installation result: Return code {result.returncode}")
#     print(f"Output: {result.stdout}")
#     print(f"Error: {result.stderr}")


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
    install_ctrl_packages_in_venv(venv_path)
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


# def install_ctrl_packages_in_venv_pkg_obj(venv_path, ctrl_pkg_version_obj):
#     pass


def install_ctrl_packages_in_venv(
    venv_path, ctrl_lib=True, ctrl_test=True, ctrl_repo_obj=False
):
    # Rename to "install_ctrl_package_in_venv"
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


# Define a wrapper function
# def block_copy_install_packages_to_venv_task(**kwargs):
#     # Call the Celery task asynchronously and block until the result is available
#     print(f"Kwargs block_copy_install_packages_to_venv_task are : {kwargs}")
#     result = copy_install_packages_to_venv_task.delay(**kwargs)
#     return result.get()  # This will block until the task is done


@shared_task(bind=True)
def copy_install_packages_to_venv_task(self, **kwargs):
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
    try:
        with transaction.atomic():
            logger.info(
                f"Inside Celery task to copy and install packages : {kwargs} : User : {kwargs['user_id']}"
            )
            # Check if 'user' exists in kwargs
            user_id = kwargs.get("user_id")
            if user_id is None:
                logger.error("User ID is None! Cannot proceed with task.")
                return
            # user = User.objects.get(id=int(kwargs.get("user")))
            user = get_user_model().objects.get(id=int(user_id))
            venv_name = kwargs.get("venv_name")
            venv_obj = get_object_or_404(
                VirtualEnvironment, venv_name=venv_name, user=user
            )
            logger.info(f"Venv object is {venv_obj}")

            # Start the VENV
            venv_path = activate_venv(venv_obj.path)
            logger.info(f"Venv activated : {venv_path}")

            # Change Virtual Env status to in-use
            venv_obj.status = "in-use"
            venv_obj.assigned_at = timezone.now()
            venv_obj.last_used_at = timezone.now()
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

            if kwargs.get("ctrl_package_version_id", False):
                latest_repo_obj = get_latest_ctrl_repo_version()
                repo_version_to_install = latest_repo_obj.repo_version
            else:
                repo_version_to_install = venv_obj.ctrl_package_version.repo_version

            logger.info(f"Repo version to install is : {repo_version_to_install}")

            copy_files(
                repo_version_to_install,
                venv_obj.path,
                requirements_file_path,
                script_file_path,
            )
            logger.info("All files copied successfully, installing packages now")

            # Install the requirements
            requirements_file_name = os.path.basename(venv_obj.requirements.name)

            # Check 2 things.
            # If package asked for
            result = install_packages(venv_obj.path, requirements_file_name)
            logger.info(f"Requirements installed : {result}")
            logger.info(
                f"repo_version_to_install installed : {repo_version_to_install}"
            )

            venv_obj.status = "free"
            venv_obj.assigned_at = timezone.now()
            venv_obj.last_used_at = timezone.now()
            venv_obj.ctrl_package_version = CtrlPackageRepo.objects.get(
                repo_version=repo_version_to_install
            )
            venv_obj.save()
            result = {
                "venv_name": kwargs.get("venv_name"),
                "user_id": kwargs.get("user_id"),
                "status": "success",
            }
            logger.info(f"copy_install_packages_to_venv_task result: {result}")
            return result
    except Exception as e:
        logger.error(f"Error copying and installing packages: {e}")
        # Set to error and then decide what to do next
        venv_obj.status = "error"
        venv_obj.assigned_at = timezone.now()
        venv_obj.last_used_at = timezone.now()
        venv_obj.save()
        raise e
    # Since this is chained with run_test_task, which expects the same inputs,
    # we return these values
    # return (kwargs.get("venv_name"), kwargs.get("user_id"))
    # Perform operations
    # result = {
    #     "venv_name": kwargs.get("venv_name"),
    #     "user_id": kwargs.get("user_id"),
    # }
    # logger.info(f"copy_install_packages_to_venv_task result: {result}")
    # venv_name = kwargs.get("venv_name")
    # user_id = kwargs.get("user_id")
    # logger.info(
    #     f"copy_install_packages_to_venv_task result: venv_name={venv_name}, user_id={user_id}"
    # )


# def save_config_to_venv(venv_id):
#     # Get the VirtualEnvironment object
#     venv = VirtualEnvironment.objects.get(id=venv_id)

#     # Get the associated Config object
#     config = venv.config_file

#     if config:  # Ensure there is a config object associated
#         # Serialize the Config object to a dictionary
#         config_dict = {
#             "nickname": config.nickname,
#             "backup_restore_config_files": config.backup_restore_config_files,
#             "validate_config_params": config.validate_config_params,
#             "os_platform": config.os_platform,
#             "rpyc_port": config.rpyc_port,
#             "topology": config.topology,
#             "card_type": config.card_type,
#             "switch_config": config.switch_config.id,  # or config.switch_config.name if you want the name
#             "sut": config.sut.id,
#             "client": config.client.id,
#             "client_2": config.client_2.id,
#             "rmii_interface": config.rmii_interface.id,
#             "fw_version": list(config.fw_version.values_list("id", flat=True)),
#             "fw_upgrade_types": list(
#                 config.fw_upgrade_types.values_list("id", flat=True)
#             ),
#             "sit": config.sit.id,
#             "spl_pkg_file_path": config.spl_pkg_file_path.id,
#             "load_roce_driver": config.load_roce_driver,
#             "inbox_driver": config.inbox_driver,
#             "driver_name": config.driver_name,
#             "client_sit": config.client_sit.id,
#             "repave": config.repave,
#             "mtu_list": config.mtu_list,
#             "vlan_id_list": config.vlan_id_list,
#             "vm_os": config.vm_os,
#             "vfs_per_pf": config.vfs_per_pf,
#             "vnic_per_vm": config.vnic_per_vm,
#             "number_of_vms_to_test": config.number_of_vms_to_test,
#             "errors_to_flag": config.errors_to_flag,
#             "fw_reset_check": config.fw_reset_check,
#             "error_recovery_check": config.error_recovery_check,
#             "cleanup_on_failure": config.cleanup_on_failure,
#         }

#         # Convert the dictionary to YAML format
#         yaml_content = yaml.dump(config_dict)

#         # Determine the destination path in the virtual environment directory
#         venv_directory = os.path.join(settings.MEDIA_ROOT, "venvs", venv.venv_name)
#         os.makedirs(
#             venv_directory, exist_ok=True
#         )  # Create the directory if it doesn't exist

#         yaml_file_path = os.path.join(venv_directory, "config.yaml")

#         # Save the YAML content to the destination path
#         with open(yaml_file_path, "w") as yaml_file:
#             yaml_file.write(yaml_content)

#         print(f"Config file saved to {yaml_file_path}")

#     else:
#         print("No config object associated with this virtual environment.")


@shared_task
def update_venv_python_version(venv_path, requested_version):
    """
    Update the Python version in the specified virtual environment if it does not match the requested version.
    """
    try:
        # Check current Python version in venv
        venv_python = os.path.join(
            venv_path, "bin", "python"
        )  # Adjust for Windows: os.path.join(venv_path, 'Scripts', 'python.exe')
        current_version = (
            subprocess.check_output([venv_python, "--version"], text=True)
            .strip()
            .split()[1]
        )

        if current_version == requested_version:
            return f"Python version in venv is already {requested_version}."

        # Download and install the requested Python version
        install_path = f"/path/to/python/versions/{requested_version}"
        if not os.path.exists(install_path):
            # Replace this with appropriate commands to download and install Python
            subprocess.run(
                [
                    "wget",
                    f"https://www.python.org/ftp/python/{requested_version}/Python-{requested_version}.tgz",
                ],
                check=True,
                shell=False,
            )
            subprocess.run(
                ["tar", "xzf", f"Python-{requested_version}.tgz"],
                check=True,
                shell=False,
            )
            subprocess.run(
                [f"Python-{requested_version}/configure", "--prefix=" + install_path],
                check=True,
                shell=False,
            )
            subprocess.run(
                ["make", "install"], cwd=install_path, check=True, shell=False
            )

        # Use the newly installed Python to update the venv
        new_python = os.path.join(install_path, "bin", "python")  # Adjust for Windows
        subprocess.run([new_python, "-m", "venv", venv_path], check=True, shell=False)

        return f"Updated venv to use Python {requested_version}."

    except subprocess.CalledProcessError as e:
        raise ValidationError(f"Error occurred: {e.output.decode()}")

    except Exception as e:
        raise ValidationError(f"An unexpected error occurred: {str(e)}")
