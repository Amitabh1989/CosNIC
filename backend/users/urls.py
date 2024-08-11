from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CheckUsernameAvailability, LoginView, RegisterView


router = DefaultRouter()
# router.register(r'check-username', CheckUsernameAvailability, basename='check-username')


urlpatterns = [
    path('', include(router.urls)),
    path('check-username/<str:username>/', CheckUsernameAvailability.as_view(), name='check-username'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
]
