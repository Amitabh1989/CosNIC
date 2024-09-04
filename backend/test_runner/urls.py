from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivateVenvCopyInstallPackages,
    CreateVenvView,
    CtrlRepoListView,
    GetUserVenvs,
    ManualScanCtrlRepoView,
    RunTestsView,
    TaskStatusView,
    TestCaseResultView,
    TestCaseView,
    TestRunView,
    UpdateTestCaseSubtestsAPI,
)

router = DefaultRouter()
router.register(r"testcase", TestCaseView, "testcase")
router.register(r"testrun", TestRunView, "testrun")
router.register(r"ctrl_repo", CtrlRepoListView, "ctrl_repo")

urlpatterns = [
    path("", include(router.urls)),
    path("task-status/<str:task_id>/", TaskStatusView.as_view(), name="task_status"),
    path(
        "testsubtest/update",
        UpdateTestCaseSubtestsAPI.as_view(),
        name="test_subtest_update",
    ),
    path("user/venvs", GetUserVenvs.as_view({"get": "list"}), name="user_venvs"),
    path("venv/create", CreateVenvView.as_view(), name="venv_create"),
    path(
        "venv/activate", ActivateVenvCopyInstallPackages.as_view(), name="venv_activate"
    ),
    path("run", RunTestsView.as_view(), name="test_run"),
    path("repo/scan", ManualScanCtrlRepoView.as_view(), name="repo_scan"),
] + router.urls
