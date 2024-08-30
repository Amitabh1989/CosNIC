# celery.py

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

from celery.schedules import crontab

# from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")  # Its the project name

# Configure Celery using settings from Django settings.py.
app.config_from_object("django.conf:settings", namespace="CELERY")


# Celery Beat Configuration
CELERY_BEAT_SCHEDULE = {
    "scan-folder-every-night": {
        "task": "test_runner.tasks.repo_jobs.scan_folder_and_update_cache",
        "schedule": crontab(hour=0, minute=0),  # Runs every night at midnight
    },
}

# app.conf.beat_schedule = {
#     "scan-folder-every-night": {
#         "task": "test_runner.tasks.repo_jobs.scan_folder_and_update_cache",
#         "schedule": crontab(hour=0, minute=0),  # Runs every night at midnight
#     },
# }

# Below has been mentioned in the settings.py file. So commented here
# CELERY_BROKER_URL = 'redis://localhost:6379/0'  # Assuming you're using Redis
# CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'


# Load tasks from all registered Django app configs.
# app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
# Load task modules from all registered Django app configs.
app.autodiscover_tasks()


#  4. Set Up Celery Beat for Periodic Tasks
@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
