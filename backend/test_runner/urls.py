from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    TestCaseView,
    TestRunView,
    TestCaseResultView,
    CreateVenvView,
    RunTestView,
)

router = DefaultRouter()
router.register(r"testcase", TestCaseView, "testcase")
router.register(r"testrun", TestRunView, "testrun")
router.register(r"testcaseresult", TestCaseResultView, "testcaseresult")

urlpatterns = [
    path("", include(router.urls)),
    path("create-venv/", CreateVenvView.as_view(), name="create_venv"),
    path("run-test/", RunTestView.as_view(), name="run_test"),
]
