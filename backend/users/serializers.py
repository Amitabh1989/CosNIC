# import requests
from tempfile import NamedTemporaryFile

import requests
from django.contrib.auth.models import User
from django.core.files import File

# from django.core.files.temp import NamedTemporaryFile
from rest_framework import serializers

from .models import UserProfile

# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField(required=True)
#     password = serializers.CharField(required=True)

#     def validate(self, data):
#         username = data.get('username')
#         password = data.get('password')

#         if username and password:
#             user = authenticate(username=username, password=password)
#             if not user:
#                 raise serializers.ValidationError("Invalid username or password.")
#         else:
#             raise serializers.ValidationError("Username and password are required.")

#         return data


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            raise serializers.ValidationError("Username and password are required.")

        # You can perform additional validation here if needed

        return data


# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True)
#     password_confirm = serializers.CharField(write_only=True)

#     class Meta:
#         model = User
#         fields = ['username', 'email', 'password', 'password_confirm']

#     def validate(self, data):
#         password = data.get('password')
#         password_confirm = data.get('password_confirm')

#         if password != password_confirm:
#             raise serializers.ValidationError("Passwords do not match.")

#         return data

#     def create(self, validated_data):
#         validated_data.pop('password_confirm')  # Remove password_confirm from the validated data
#         user = User.objects.create_user(
#             username=validated_data['username'],
#             email=validated_data['email'],
#             password=validated_data['password']
#         )
#         return user


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ("username", "password", "email")

    def create(self, validated_data):
        print(f"Validated data is : {validated_data}")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


class ProfileSerializer(serializers.ModelSerializer):
    # Adding fields that are related to the User model
    username = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ("username", "email", "nickname", "avatar")

    def get_username(self, obj):
        return obj.user.username

    def get_email(self, obj):
        return obj.user.email

    def save(self, **kwargs):
        user_profile = super().save(**kwargs)
        if not user_profile.avatar:
            avatar_file = generate_avatar(user_profile.user.username)
            user_profile.avatar.save(avatar_file.name, avatar_file, save=True)
        return user_profile


# def generate_avatar(name):
#     """
#     Generates a URL for an avatar based on the given name using UI Avatars API.

#     Args:
#         name (str): The name to use for the avatar.

#     Returns:
#         str: The generated avatar URL.
#     """

#     base_url = "https://ui-avatars.com/api/"
#     params = {
#         "name": name,
#         "background": "0D8ABC",  # Customize background color
#         "color": "fff",  # Customize text color
#     }

#     url = base_url + "?" + urllib3.parse.urlencode(params)
#     response = urllib3.request("GET", url)

#     if response.status == 200:
#         print(
#             f"Avatar image fetched successfully : resp : {response}  :   {response.data}"
#         )
#         with NamedTemporaryFile(delete=False) as temp_file:
#             temp_file.write(response.content)
#             return temp_file
#     else:
#         raise Exception(f"Error fetching avatar image: {response.status_code}")


def generate_avatar(name):
    """
    Generates a URL for an avatar based on the given name using UI Avatars API.

    Args:
        name (str): The name to use for the avatar.

    Returns:
        str: The path to the saved avatar file.
    """
    print(f"name is {name}")
    base_url = "https://ui-avatars.com/api/"
    params = {
        "name": name,
        "background": "0D8ABC",  # Customize background color
        "color": "fff",  # Customize text color
    }

    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        temp_file = NamedTemporaryFile(
            delete=False, suffix=".png"
        )  # Keep the file open
        temp_file.write(response.content)
        temp_file.flush()  # Make sure all data is written to the file
        return File(
            open(temp_file.name, "rb"), name=f"{name}.png"
        )  # Reopen and return the file object
    else:
        raise Exception(f"Error fetching avatar image: {response.status_code}")


""" 
The warning you're encountering:

```plaintext
StreamingHttpResponse must consume synchronous iterators in order to serve them asynchronously. Use an asynchronous iterator instead.
```

This is Django alerting you that a `StreamingHttpResponse` is being served in an asynchronous context, but the iterator used to stream the response is synchronous.

Since you're serving media files and it's handled by Django’s default media file serving during development, the warning likely arises from the synchronous nature of how media files are served in development mode. When Django is in production, this is usually handled by a dedicated server like Nginx or Apache.

### How to resolve:

1. **For development, you can safely ignore this warning**, as it's mainly there to inform you that the media file serving process isn't optimized for async.
   
2. **For production**, you should let a web server like Nginx or Apache handle media files instead of Django. Django is not designed to serve static or media files in production.

Here’s a suggestion for your `settings.py` (for development only):

### Update for `settings.py` (if you haven't already):
```python
if DEBUG:
    from django.conf.urls.static import static
    from django.conf import settings
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### For production:
Make sure you configure your web server (like Nginx) to serve media files, which will avoid this issue entirely.

This warning will not affect how media files are served in development, but for production, you should ensure that your media files are handled by an efficient web server.
"""
