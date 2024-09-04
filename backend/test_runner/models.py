import os
from datetime import datetime

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils import timezone
from sutclient.models import Config

# from django.db.postgresql.fields import ArrayField

# Create your models here.


class TestCase(models.Model):
    tcid = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=250)
    path = models.CharField(max_length=500)
    suite_name = models.CharField(max_length=100, blank=True, null=True)
    applicable_os = models.CharField(
        max_length=20, blank=True, null=True, default="linux"
    )
    feature = models.CharField(max_length=100, blank=True, null=True)
    sub_feature = models.CharField(max_length=100, blank=True, null=True)
    controllers = models.JSONField(default=list)
    category = models.CharField(
        max_length=20,
        choices=[
            ("stress", "Stress"),
            ("functional", "Functional"),
            ("hammer", "Hammer"),
            ("sanity", "Sanity"),
        ],
        default="functional",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        """
        5. Indexing for Performance
        If you expect to run these queries frequently, consider adding a
        database index on the controllers field to improve query performance:
        """

        indexes = [
            models.Index(fields=["controllers"]),
        ]

    def __str__(self):
        return f"{self.tcid} : {self.title}"


class SubTests(models.Model):
    test_case = models.ForeignKey(
        TestCase, related_name="subtests", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=250)
    path = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.test_case.tcid} : {self.name}"


def create_path(instance, filename):
    base_dir = f"user_{instance.user.id}/{instance.test_case.tcid}/run_{instance.id}"
    date_dir = datetime.now().strftime("%Y-%m-%d")
    result_dir = f"result_{instance.status}"
    path = os.path.join(settings.LOGS_PATH, base_dir, date_dir, result_dir)
    print(f"Log and uploads path is : {path}")
    os.makedirs(path, exist_ok=True)
    return os.path.join(path, filename)


def logs_upload_path(instance, filename):
    # args here is automatically passed by django once file is uploaded
    # This function will generate the path dynamically
    return f"logs/{instance.user.id}/{instance.name}/{filename}"


def reports_upload_path(instance, filename):
    # args here is automatically passed by django once file is uploaded
    # This function will generate the path dynamically
    return f"pytest_reports/{instance.user.id}/{instance.name}/{filename}"


class TestRun(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("running", "Running"),
        ("passed", "Passed"),
        ("failed", "Failed"),
        ("aborted", "Aborted"),
    ]
    nickname = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(
        max_length=20,
        choices=[
            ("stress", "Stress"),
            ("functional", "Functional"),
            ("hammer", "Hammer"),
            ("sanity", "Sanity"),
        ],
        default="functional",
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="test_runs")
    test_case = models.ForeignKey(
        TestCase,
        on_delete=models.CASCADE,
        related_name="test_runs",
        blank=True,
        null=True,
    )
    test_job = models.ForeignKey(
        "TestJob",
        on_delete=models.CASCADE,
        related_name="test_runs",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    subtests_to_run = ArrayField(
        models.CharField(), default=list
    )  # Meaning run all subtests
    error = models.TextField(blank=True)
    log_file = models.FileField(
        upload_to=create_path, blank=True, null=True, max_length=500
    )
    report_file = models.FileField(
        upload_to=create_path, blank=True, null=True, max_length=500
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    def __str__(self):
        return f"Test Run {self.id} by {self.user.username}"


class TestCaseResult(models.Model):
    test_case = models.ForeignKey(TestCase, on_delete=models.CASCADE)
    test_run = models.ForeignKey(TestRun, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[("passed", "Passed"), ("failed", "Failed"), ("aborted", "Aborted")],
    )
    output = models.TextField()
    error = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    end_time = models.DateTimeField(null=True, blank=True)
    log = models.TextField(blank=True)
    zipped_log = models.FileField(upload_to="logs/", blank=True, null=True)

    def __str__(self):
        return f"Test Case {self.test_case.tcid} in test_run {self.test_run.id}"


class Server(models.Model):
    name = models.CharField(max_length=100)
    ip = models.GenericIPAddressField()
    capacity = models.IntegerField()
    current_load = models.IntegerField()
    port = models.IntegerField()
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    os_name = models.CharField(
        max_length=100, choices=[("rhel", "RHEL"), ("windows", "Windows")]
    )
    kernel = models.CharField(max_length=100)

    def __str__(self):
        return self.name


def requirements_upload_path(instance, filename):
    # args here is automatically passed by django once file is uploaded
    # This function will generate the path dynamically
    return f"requirements/{instance.user.id}/{instance.venv_name}/{filename}"


def scripts_upload_path(instance, filename):
    # args here is automatically passed by django once file is uploaded
    # This function will generate the path dynamically
    return f"scripts/{instance.user.id}/{instance.venv_name}/{filename}"


class CtrlPackageRepo(models.Model):
    # repo_version = models.JSONField(default=list)
    repo_version = models.CharField(
        max_length=100, default="Controller-2.2.9a63", unique=True
    )
    last_scanned = models.DateTimeField(auto_now=True)
    url = models.URLField(blank=True, null=True)  # incase i need to read from ftp
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.repo_version}"  # Just a simple human-readable string


class TestJob(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("running", "Running"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("aborted", "Aborted"),
    ]
    test_run = models.OneToOneField(
        TestRun, on_delete=models.CASCADE, blank=True, null=True
    )
    celery_job_id = models.CharField(max_length=100, blank=True, null=True)
    retries = models.IntegerField(default=1)
    retry_delay = models.IntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    celery_result = models.TextField(blank=True, null=True)
    venv = models.ForeignKey(
        "VirtualEnvironment",
        on_delete=models.CASCADE,
        related_name="test_jobs",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"A job for {self.test_run} has been created successfully : status : {self.status}"


class VirtualEnvironment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="venv")
    server = models.ForeignKey(
        Server, on_delete=models.CASCADE, blank=True, null=True, related_name="venv"
    )
    config_file = models.ForeignKey(
        Config,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    nickname = models.CharField(max_length=100, blank=True, null=True)
    venv_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    ctrl_package_version = models.ForeignKey(
        CtrlPackageRepo,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="venv",
    )
    status = models.CharField(
        max_length=50,
        default="created",
        choices=[
            ("created", "Created"),
            ("in-use", "In Use"),
            ("free", "Free"),
            ("deleted", "Deleted"),
            ("error", "Error"),
        ],
    )
    path = models.CharField(
        max_length=500, blank=True, null=True
    )  # Filled by celery task once venv is created
    python_version = models.CharField(max_length=20, default="3.9")
    lease_duration = models.DurationField(blank=True, null=True)
    assigned_at = models.DateTimeField(blank=True, null=True)
    last_used_at = models.DateTimeField(blank=True, null=True)
    requirements = models.FileField(
        upload_to=requirements_upload_path, blank=True, null=True
    )
    script = models.FileField(upload_to=scripts_upload_path, blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "venv_name"], name="unique_venv_name_per_user"
            )
        ]

    def __str__(self):
        return f"{self.venv_name} at path {self.path}"
