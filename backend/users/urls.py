from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CheckUsernameAvailability, LoginView, RegisterView, LogoutView


router = DefaultRouter()
# router.register(r'check-username', CheckUsernameAvailability, basename='check-username')


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
]
