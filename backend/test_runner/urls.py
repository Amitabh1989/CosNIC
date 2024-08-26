from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import TestCaseView, TestRunView, TestCaseResultView

router = DefaultRouter()
router.register(r"testcase", TestCaseView, "testcase")
router.register(r"testrun", TestRunView, "testrun")
router.register(r"testcaseresult", TestCaseResultView, "testcaseresult")

urlpatterns = [
    path("", include(router.urls)),
]
