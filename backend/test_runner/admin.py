from django.contrib import admin

from .models import (
    CtrlPackageRepo,
    SubTests,
    TestCase,
    TestCaseResult,
    TestJob,
    TestRun,
    VirtualEnvironment,
)


# Register your models here.
class TestCaseResultAdmin(admin.ModelAdmin):
    list_display = ("id", "test_run", "status", "created_at")
    list_display_links = ("id", "test_run")


class TestCaseResultInline(admin.TabularInline):
    model = TestCaseResult
    extra = 1  # Number of empty forms to display


class TestRunAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "test_case", "created_at", "status")
    list_display_links = ("id", "user")
    readonly_fields = ("created_at", "modified_at")
    # inlines = [TestCaseResultInline]


class TestRunResultInline(admin.TabularInline):
    model = TestRun
    fields = ("id", "status", "user", "log_file")
    readonly_fields = ("id",)  # Make fields read-only if needed
    extra = 0  # Number of empty forms to display


class SubTestInline(admin.StackedInline):
    model = SubTests
    extra = 0  # Adj


class TestCaseAdmin(admin.ModelAdmin):
    list_display = (
        "tcid",
        "title",
        "category",
        "path",
        "subtest_count",
        "controller_count",
    )
    list_display_links = ("tcid", "title")
    inlines = [SubTestInline, TestRunResultInline]

    def subtest_count(self, obj):
        """
        Returns the count of SubTests related to this TestCase.
        """
        return (
            obj.subtests.count()
        )  # Assuming a reverse relationship named 'subtests' exists

    subtest_count.short_description = "Number of Subtests"

    def controller_count(self, obj):
        """
        Returns the number of unique controllers in the controllers JSON field.
        """
        return len(obj.controllers)

    controller_count.short_description = "Number of Supported Controllers"


class VirtualEnvironmentAdmin(admin.ModelAdmin):
    list_display = ("id", "venv_name", "user", "created_at")
    list_display_links = ("id", "venv_name")


class VirtualEnvironmentAdminInline(admin.TabularInline):
    model = VirtualEnvironment
    extra = 1  # Number of empty forms to display


class TestJobAdmin(admin.ModelAdmin):
    list_display = ("id", "test_run", "celery_result")


# @admin.register(CtrlPackageRepo)
# class CtrlPackageRepoAdmin(admin.ModelAdmin):
#     list_display = ["last_scanned"]
#     search_fields = ["repo_versions"]


@admin.register(CtrlPackageRepo)
class CtrlPackageRepoAdmin(admin.ModelAdmin):
    list_display = ("last_scanned", "repo_version", "url")  # Adjust as needed


admin.site.register(TestJob, TestJobAdmin)
# The line `admin.site.register(TestCase, TestCaseAdmin)` is used to register the `TestCase` model with the `TestCaseAdmin` class in the Django admin interface.
admin.site.register(TestCase, TestCaseAdmin)
admin.site.register(TestRun, TestRunAdmin)
admin.site.register(TestCaseResult, TestCaseResultAdmin)
admin.site.register(VirtualEnvironment, VirtualEnvironmentAdmin)
