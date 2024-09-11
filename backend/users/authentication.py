# backends.py

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class EmailBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        UserModel = get_user_model()
        print("Request in EMAIL Backend is : ", request)
        print(f"Email is {email} and password is {password}")
        try:
            # Try to get the user by email
            user = UserModel.objects.get(email=email)
            # Check if the password is correct
            if user.check_password(password):
                return user
        except UserModel.DoesNotExist:
            return None
