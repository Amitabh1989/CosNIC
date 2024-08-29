from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

# from .models import User
from django.contrib.auth import get_user_model
from rest_framework import permissions
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from .serializers import LoginSerializer, RegisterSerializer

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

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

# class CheckUsernameAvailability(viewsets.ViewSet):
#     # @action(detail=False, methods=['get'])
#     permission_classes = [IsAuthenticatedOrReadOnly]
#     # def retrieve(self, request, username):
#     #     username = request.query_params.get('username')
#     #     if User.objects.filter(username=username).exists():
#     #         return Response({'available': False})
#     #     return Response({'available': True})
#     def retrieve(self, request, username):
#         user = get_object_or_404(User, username=username)
#         return Response({'available': False if user else True})


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
    queryset = User.objects.all()
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data["username"],
                password=serializer.validated_data["password"],
            )
            if user:
                login(request, user)
                # refresh = RefreshToken.for_user(user)
                # return Response({'refresh': str(refresh), 'access': str(refresh.access_token)}, status=status.HTTP_200_OK)
                return Response({"msg": "User logged in"}, status=status.HTTP_200_OK)
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# LogoutView with CSRF exemption
# The `@method_decorator(csrf_exempt, name="dispatch")` decorator is used in Django to exempt a specific method from CSRF verification. In this case, it is applied to the `LoginView` class to exempt the `dispatch` method from CSRF protection. This means that the `dispatch` method of the `LoginView` class will not require CSRF tokens for protection against Cross-Site Request Forgery (CSRF) attacks.
@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "User logged out"}, status=status.HTTP_200_OK)
