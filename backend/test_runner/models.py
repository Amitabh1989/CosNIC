from django.db import models
from django.contrib.auth.models import User

# from django.db.postgresql.fields import ArrayField

# Create your models here.


class TestCase(models.Model):
    tcid = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    path = models.CharField(max_length=500)
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

    def __str__(self):
        return f"{self.tcid} : {self.title}"


class TestRun(models.Model):
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
    test_cases = models.ManyToManyField(TestCase, through="TestCaseResult")
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("running", "Running"),
            ("completed", "Completed"),
            ("failed", "Failed"),
            ("aborted", "Aborted"),
        ],
    )

    def __str__(self):
        return f"Test Run {self.id} by {self.user.username}"


class TestCaseResult(models.Model):
    test_case = models.ForeignKey(TestCase, on_delete=models.CASCADE)
    # test_case = models.ManyToManyField(TestCase)
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
    return f"requirements/{instance.user.id}/{instance.name}/{filename}"


def scripts_upload_path(instance, filename):
    # args here is automatically passed by django once file is uploaded
    # This function will generate the path dynamically
    return f"scripts/{instance.user.id}/{instance.name}/{filename}"


class TestJob(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("running", "Running"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("aborted", "Aborted"),
    ]
    script_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    log_file_path = models.TextField(null=True, blank=True)  # Path to the log file

    def __str__(self):
        return f"A job for {self.script_name} has been created successfully : status : {self.status}"


class VirtualEnvironment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="venv")
    server = models.ForeignKey(
        Server, on_delete=models.CASCADE, blank=True, null=True, related_name="venv"
    )
    nickname = models.CharField(max_length=100, blank=True, null=True)
    name = models.CharField(max_length=255)
    test_jobs = models.ManyToManyField(TestJob, related_name="venv")
    created_at = models.DateTimeField(auto_now_add=True)
    ctrl_package_version = models.CharField(max_length=255, blank=True, null=True)
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
                fields=["user", "name"], name="unique_venv_name_per_user"
            )
        ]

    def __str__(self):
        return self.name
