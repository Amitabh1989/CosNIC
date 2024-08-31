from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    TestCaseView,
    TestRunView,
    TestCaseResultView,
    CreateVenvView,
    TaskStatusView,
    StartVenvCopyInstallPackages,
    RunTestsView,
    ManualScanCtrlRepoView,
    FolderListView,
)

router = DefaultRouter()
router.register(r"testcase", TestCaseView, "testcase")
router.register(r"testrun", TestRunView, "testrun")
router.register(r"testcaseresult", TestCaseResultView, "testcaseresult")

urlpatterns = [
    path("", include(router.urls)),
    path("task-status/<str:task_id>/", TaskStatusView.as_view(), name="task_status"),
    path("venv/create", CreateVenvView.as_view(), name="venv_create"),
    path("venv/install", StartVenvCopyInstallPackages.as_view(), name="venv_install"),
    path("run", RunTestsView.as_view(), name="test_run"),
    # path("test/status", RunTestsView.as_view(), name="test_status"),
    path("repo/scan", ManualScanCtrlRepoView.as_view(), name="repo_scan"),
    path("repo/list", FolderListView.as_view(), name="repo_list"),
]
