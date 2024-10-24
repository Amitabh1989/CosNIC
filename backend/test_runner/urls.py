from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivateVenvCopyInstallPackages,
    CreateVenvView,
    CtrlRepoListView,
    GetUserVenvs,
    ManualScanCtrlRepoView,
    RequirementsModelView,
    RunTestsView,
    TaskStatusView,
    TestCaseResultView,
    TestCaseView,
    TestRunView,
    UpdateTestCaseSubtestsAPI,
    VenvStatusView,
)

router = DefaultRouter()
router.register(r"testcase", TestCaseView, "testcase")
router.register(r"testrun", TestRunView, "testrun")
router.register(r"ctrl_repo", CtrlRepoListView, "ctrl_repo")
router.register(r"user/venvs", GetUserVenvs, "user_venvs")
router.register(r"venv/status", VenvStatusView, "venv-status")
router.register(r"venv/reqs", RequirementsModelView, "venv-requirements")

urlpatterns = [
    path("", include(router.urls)),
    path("task_status/<str:task_id>/", TaskStatusView.as_view(), name="task_status"),
    path(
        "testsubtest/update",
        UpdateTestCaseSubtestsAPI.as_view(),
        name="test_subtest_update",
    ),
    # path("user/venvs", GetUserVenvs.as_view({"get": "list"}), name="user_venvs"),
    path("venv/create", CreateVenvView.as_view(), name="venv_create"),
    path(
        "venv/activate",
        ActivateVenvCopyInstallPackages.as_view(),
        name="venv_activate",
    ),
    path("run", RunTestsView.as_view(), name="test_run"),
    path("repo/scan", ManualScanCtrlRepoView.as_view(), name="repo_scan"),
    # path(
    #     "venv-status/<int:user_id>/",
    #     VenvStatusView.as_view({"get": "retrieve"}),
    #     name="venv-status-by-id",
    # ),
] + router.urls
