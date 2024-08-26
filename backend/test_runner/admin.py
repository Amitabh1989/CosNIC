from django.contrib import admin
from .models import TestCase, TestRun, TestCaseResult

# Register your models here.


class TestCaseAdmin(admin.ModelAdmin):
    list_display = ("tcid", "title", "path")
    list_display_links = ("tcid", "title")


class TestRunAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at", "status")
    list_display_links = ("id", "user")


class TestCaseResultAdmin(admin.ModelAdmin):
    list_display = ("test_case", "test_run", "status", "created_at")
    list_display_links = ("test_case", "test_run")


admin.site.register(TestCase, TestCaseAdmin)
admin.site.register(TestRun, TestRunAdmin)
admin.site.register(TestCaseResult, TestCaseResultAdmin)
