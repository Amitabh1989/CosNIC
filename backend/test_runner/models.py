from django.db import models
from django.contrib.auth.models import User

# from django.db.postgresql.fields import ArrayField

# Create your models here.


class TestCase(models.Model):
    tcid = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    path = models.CharField(max_length=500)

    def __str__(self):
        return f"{self.tcid} : {self.title}"


class TestRun(models.Model):
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

    def __str__(self):
        return f"Test Case {self.test_case.tcid} in Run {self.test_run.id}"
