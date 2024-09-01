from django.contrib import admin
from .models import (
    TestCase,
    TestRun,
    TestCaseResult,
    VirtualEnvironment,
    TestJob,
    CtrlPackageRepo,
    SubTests,
)

# Register your models here.


# class TestCaseAdmin(admin.ModelAdmin):
#     list_display = ("tcid", "title", "category", "path")
#     list_display_links = ("tcid", "title")


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
    list_display = ("tcid", "title", "category", "path")
    list_display_links = ("tcid", "title")
    inlines = [SubTestInline, TestRunResultInline]


class VirtualEnvironmentAdmin(admin.ModelAdmin):
    list_display = ("id", "venv_name", "user", "created_at")
    list_display_links = ("id", "venv_name")


# class VirtualEnvironmentAdminInline(admin.TabularInline):
#     model = VirtualEnvironment
#     extra = 1  # Number of empty forms to display


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
admin.site.register(TestCase, TestCaseAdmin)
admin.site.register(TestRun, TestRunAdmin)
admin.site.register(TestCaseResult, TestCaseResultAdmin)
admin.site.register(VirtualEnvironment, VirtualEnvironmentAdmin)
