from rest_framework import serializers
from django.contrib.auth.models import User


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
        username = data.get('username')
        password = data.get('password')

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
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user