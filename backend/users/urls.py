from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CheckUsernameAvailability,
    LoginView,
    LogoutView,
    ProfileView,
    RegisterView,
)

router = DefaultRouter()


urlpatterns = [
    path("", include(router.urls)),
    path(
        "check-username/<str:username>/",
        CheckUsernameAvailability.as_view(),
        name="check-username",
    ),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
]
