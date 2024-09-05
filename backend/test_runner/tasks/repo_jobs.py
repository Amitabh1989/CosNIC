import os

# from django.exceptions import IntegrityError
import re
import stat
from typing import List

from celery import shared_task
from django.conf import settings
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

# from django_cron import CronJobBase, Schedule
from ..models import CtrlPackageRepo


def parse_version(version: str) -> tuple:
    """
    Parse a version string into a tuple of its numeric and alpha components.

    Args:
        version (str): The version string to parse.

    Returns:
        tuple: A tuple containing the major, minor, patch version and a suffix.
    """
    match = re.match(r"^Controller-(\d+)\.(\d+)\.(\d+)([a-zA-Z]\d+)?$", version)
    if not match:
        raise ValueError(f"Invalid version format: {version}")

    major, minor, patch, suffix = match.groups()
    return (int(major), int(minor), int(patch), suffix or "")


# def get_latest_ctrl_repo_version() -> CtrlPackageRepo:
#     """
#     Get the CtrlPackageRepo object corresponding to the latest version.

#     Returns:
#         CtrlPackageRepo: The CtrlPackageRepo object with the latest version.

#     Raises:
#         ValueError: If no versions are found in the database.
#     """
#     # Fetch all CtrlPackageRepo objects and extract version names and objects
#     versions_with_objects = CtrlPackageRepo.objects.all()
#     if not versions_with_objects:
#         raise ValueError("No versions found in the database.")

#     # Extract version names and corresponding objects
#     version_names = [obj.repo_version for obj in versions_with_objects]

#     # Parse and sort versions based on numeric and alpha components
#     parsed_versions = [
#         (obj, parse_version(obj.repo_version)) for obj in versions_with_objects
#     ]
#     parsed_versions.sort(key=lambda x: x[1], reverse=True)

#     # The first element in the sorted list is the latest version
#     latest_version_object = parsed_versions[0][0]
#     print("Latest repo version object: ", latest_version_object)

#     return latest_version_object


def get_latest_ctrl_repo_version() -> CtrlPackageRepo:
    """
    Get the CtrlPackageRepo object corresponding to the latest version.

    Returns:
        CtrlPackageRepo: The CtrlPackageRepo object with the latest version.

    Raises:
        ValueError: If no versions are found in the database.
    """
    # Fetch all CtrlPackageRepo objects
    versions_with_objects = CtrlPackageRepo.objects.all()
    if not versions_with_objects:
        raise ValueError("No versions found in the database.")

    # Parse and sort versions based on numeric and alpha components
    parsed_versions = [
        (obj, parse_version(obj.repo_version)) for obj in versions_with_objects
    ]
    # Sort in descending order (latest version first)
    parsed_versions.sort(key=lambda x: x[1], reverse=True)

    # Ensure the latest version object is retrieved
    latest_version_object = parsed_versions[0][0]

    print(f"Latest repo version object: {latest_version_object}")
    print(
        f"Latest repo version details - version: {latest_version_object.repo_version}, path: {latest_version_object.local_path}"
    )

    return latest_version_object


# Example usage
# versions = ["Controller-2.2.9a63", "Controller-2.1.10a67", "Controller-2.3.10b67"]

# latest_version = get_latest_version(versions)
# print(f"The latest version is: {latest_version}")


def sort_versions(versions):
    def version_key(version):
        # Extract the numeric parts of the version
        match = re.search(r"(\d+)\.(\d+)\.(\d+)[a-z](\d+)", version)
        if match:
            return tuple(map(int, match.groups()))
        return ()

    return sorted(versions, key=version_key, reverse=True)


@shared_task
def scan_folder_and_update_cache(start_name=None):
    if start_name is None:
        start_name = "Controller-"
    folder_path = os.path.join(settings.REPO_ROOT)
    repo_versions = [
        name
        for name in os.listdir(folder_path)
        if os.path.isdir(os.path.join(folder_path, name))
    ]
    repo_versions = [
        name for name in repo_versions if name.startswith(start_name)
    ]  # Filter by name
    print(f"Repo versions celery : {repo_versions}")

    with transaction.atomic():
        for repo in repo_versions:
            try:
                repo, created = CtrlPackageRepo.objects.get_or_create(repo_version=repo)
                print(f"Repo celery : {repo}, {created}")
                if created:
                    repo.save()
            except IntegrityError as e:
                print(f"IntegrityError: {e}")
    print(f"Celery scanned folder and completed updating cache : {repo_versions}")
