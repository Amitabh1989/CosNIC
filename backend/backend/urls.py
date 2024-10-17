"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# from .models import BlacklistedToken


# def is_token_blacklisted(token):
#     # print(f"{BlacklistedToken.objects.filter(id__startswith=1)}")
#     try:
#         blacklisted = BlacklistedToken.objects.filter(token=token).exists()
#     except BlacklistedToken.DoesNotExist:
#         blacklisted = True
#     print(f"Checking if token is blacklisted : {blacklisted}")
#     return blacklisted


# # In your token refresh view
# class TokenRefreshView(TokenRefreshView):
#     def post(self, request, *args, **kwargs):
#         print(f"Token refresh request : {request.data}")
#         print(f"Kwargs : {kwargs}, args : {args}")
#         # Check if refresh token is blacklisted
#         refresh_token = request.data.get("refresh")
#         if refresh_token and is_token_blacklisted(refresh_token):
#             return Response(
#                 {"error": "Token is blacklisted"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         return super().post(request, *args, **kwargs)


urlpatterns = [
    path("admin/", admin.site.urls),
    # ===================== #
    # Authentication
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # ===================== #
    # User
    path("user/", include("users.urls")),
    path("configuration/", include("configfile.urls")),
    path("testops/", include("test_runner.urls")),
    path("pulse/", include("pulse.urls")),
    # ===================== #
    # DRF session-based authentication endpoints for browsable API
    path("api-auth/", include("rest_framework.urls", namespace="rest_api")),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


"""
Important Notes
For Development Only: The media serving configuration provided above
(static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)) is intended
for development purposes.

In production, you should use a proper web server (e.g., Nginx, Apache) to serve media files.

Check File Permissions: Ensure that the directory where media files are stored
has the correct permissions for the web server or Django development server to access.
"""

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.LOG_URL, document_root=settings.LOGS_ROOT)
    urlpatterns += static(settings.REPO_URL, document_root=settings.REPO_ROOT)


"""
BASE_DIR = Path(__file__).resolve().parent.parent
REPO_PATH = Path(__file__).resolve().parent.parent.parent / "ctrl_repo"
LOGS_PATH = Path(__file__).resolve().parent.parent / "test_logs"
# settings.py
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
"""
