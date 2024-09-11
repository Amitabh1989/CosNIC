# from .models import User
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.db import IntegrityError
from django.shortcuts import get_object_or_404, render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status, viewsets
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, ProfileSerializer, RegisterSerializer

# from .views import UserProfile

# # Create your views here.
# class CheckUsernameAvailability(APIView):
#     def get(self, request, *args, **kwargs):
#         username =  username = request.query_params.get('username')
#         if User.objects.filter(username=username).exists():
#             return Response({"message": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
#         return Response({"message": "Username is available"}, status=status.HTTP_200_OK)


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.method in permissions.SAFE_METHODS or request.user.is_authenticated
        )


User = get_user_model()


class CheckUsernameAvailability(APIView):

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, username):
        print(f"Request method: {request.method}")
        print(f"Requested username: {username}")
        print(f"All username names are {User.objects.all()}")
        print(
            f"All user names : {username} -> {User.objects.filter(username=username)}"
        )
        if User.objects.filter(username=username).exists():
            return Response(
                {"message": f'Username "{username}" already exists'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"message": f'Username "{username}" is available'},
            status=status.HTTP_200_OK,
        )


# @method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    # queryset = User.objects.all()
    permission_classes = [AllowAny]

    """
    Since you're using email for authentication, but relying on the default ModelBackend,
    you'll need to override the default behavior to authenticate users by their email instead of their username.

    Steps to Implement Solution 1 with Minimal Changes:
    Custom Authentication Backend: Create a custom backend where authentication is performed
    using the email field instead of username.

    Custom Backend Path: Add the custom backend in the AUTHENTICATION_BACKENDS list.

    Custom Backend Code
    Create a new file for the custom backend, e.g., authentication.py inside one of your apps (like users):
    """

    def post(self, request, *args, **kwargs):
        print("Data in request is : ", request.data)
        email = request.data.get("email")
        serializer = LoginSerializer(
            data={
                "email": email,
                "password": request.data.get("password"),
            }
        )
        print(f"Serialized data is {serializer}")
        if serializer.is_valid():
            print(f"Serializer is valid : {serializer.validated_data}")
            user = authenticate(
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
            )
            print(f"Serialized data user  is {user}")
            if user:
                print(f"User is : {user}")
                login(request, user)
                refresh = RefreshToken.for_user(user)
                print(f"Refresh token is : {refresh}")
                print(f"Access token is : {refresh.access_token}")
                return Response(
                    {"refresh": str(refresh), "access": str(refresh.access_token)},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        print("Data in request is : ", request.data)
        serializer = RegisterSerializer(data=request.data)
        try:
            if serializer.is_valid():
                serializer.save()
                print("User is valid")
                try:
                    print(f"Serilaized data : {serializer.data}")
                except Exception as e:
                    print(f"Error is : {str(e)}")
                return Response(
                    {"message": "User registered successfully"},
                    status=status.HTTP_201_CREATED,
                )
        except IntegrityError:
            return Response(
                {"message": "User with this email already exists, try logging in"},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# LogoutView with CSRF exemption
# The `@method_decorator(csrf_exempt, name="dispatch")` decorator is used in Django to exempt a specific method from CSRF verification. In this case, it is applied to the `LoginView` class to exempt the `dispatch` method from CSRF protection. This means that the `dispatch` method of the `LoginView` class will not require CSRF tokens for protection against Cross-Site Request Forgery (CSRF) attacks.
# @method_decorator(csrf_exempt, name="dispatch")
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            logout(request)
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the refresh token
            return Response({"message": "User logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"message": f"Error logging out user: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


@method_decorator(csrf_exempt, name="dispatch")
# @csrf_exempt
class ProfileView(APIView):
    # https://api.multiavatar.com/
    # https://multiavatar.com/
    """
    let avatarId = 'Binx Bond'
    fetch('https://api.multiavatar.com/'
    +JSON.stringify(avatarId))
      .then(res => res.text())
      .then(svg => console.log(svg))
    """
    # queryset = User.objects.all()
    # serializer_class = ProfileSerializer
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        print(f"Request in ProfileView : {request.user}")
        user = get_object_or_404(User, id=request.user.id)
        serializer = ProfileSerializer(user.profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
