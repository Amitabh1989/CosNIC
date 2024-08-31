import os
import re
from django.conf import settings
from django.utils import timezone

# from django_cron import CronJobBase, Schedule
from ..models import CtrlPackageRepo

from celery import shared_task


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
    folder_path = os.path.join(settings.REPO_REPO)
    repo_versions = [
        name
        for name in os.listdir(folder_path)
        if os.path.isdir(os.path.join(folder_path, name))
    ]
    repo_versions = [
        name for name in repo_versions if name.startswith(start_name)
    ]  # Filter by name
    cache, created = CtrlPackageRepo.objects.get_or_create(id=1)
    cache.repo_versions = sort_versions(repo_versions)
    cache.last_scanned = timezone.now()
    cache.save()
    print(f"Celery scanned folder and completed updating cache : {repo_versions}")
