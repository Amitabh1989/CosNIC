from django.contrib import admin
from .models import TestCase, TestRun, TestCaseResult

# Register your models here.


class TestCaseAdmin(admin.ModelAdmin):
    list_display = ("tcid", "title", "category", "path")
    list_display_links = ("tcid", "title")


class TestCaseResultAdmin(admin.ModelAdmin):
    list_display = ("id", "test_run", "status", "created_at")
    list_display_links = ("id", "test_run")


class TestCaseResultInline(admin.TabularInline):
    model = TestCaseResult
    extra = 1  # Number of empty forms to display


class TestRunAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at", "status")
    list_display_links = ("id", "user")
    readonly_fields = ("created_at", "modified_at")
    inlines = [TestCaseResultInline]


admin.site.register(TestCase, TestCaseAdmin)
admin.site.register(TestRun, TestRunAdmin)
admin.site.register(TestCaseResult, TestCaseResultAdmin)
