import os
import re
from django.conf import settings
from django.utils import timezone
from django.db import transaction, IntegrityError
from django.shortcuts import get_object_or_404


# from django_cron import CronJobBase, Schedule
from ..models import CtrlPackageRepo

from celery import shared_task

# from django.exceptions import IntegrityError


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
