# Create your models here.
from django.contrib.auth.models import (
    BaseUserManager,
    AbstractBaseUser,
    PermissionsMixin,
)
from django.db import models
from django.contrib.auth.models import User


class UserManager(BaseUserManager):
    def create_user(self, email, username=None, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")

        email = self.normalize_email(email)

        if not username:
            username = email
            print(
                "Since no username was provided, the email will be used as the username"
            )

        else:
            username = self.model.normalize_username(username)

        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    """
    Reason why we have custom code to override the default User model:
    auth.User.groups: (fields.E304) Reverse accessor 'Group.user_set' for 'auth.User.groups' clashes with reverse accessor for 'users.User.groups'.
        HINT: Add or change a related_name argument to the definition for 'auth.User.groups' or 'users.User.groups'.
    auth.User.user_permissions: (fields.E304) Reverse accessor 'Permission.user_set' for 'auth.User.user_permissions' clashes with reverse accessor for 'users.User.user_permissions'.
        HINT: Add or change a related_name argument to the definition for 'auth.User.user_permissions' or 'users.User.user_permissions'.
    users.User.groups: (fields.E304) Reverse accessor 'Group.user_set' for 'users.User.groups' clashes with reverse accessor for 'auth.User.groups'.
        HINT: Add or change a related_name argument to the definition for 'users.User.groups' or 'auth.User.groups'.
    users.User.user_permissions: (fields.E304) Reverse accessor 'Permission.user_set' for 'users.User.user_permissions' clashes with reverse accessor for 'auth.User.user_permissions'.
        HINT: Add or change a related_name argument to the definition for 'users.User.user_permissions' or 'auth.User.user_permissions'.
    
    # =======================================
    Explanation of the Changes
    Custom related_name:

    groups field:
    Changed the related_name to 'custom_user_set' to avoid conflicts with the default User.groups field.
    user_permissions field:
    Changed the related_name to 'custom_user_set' to avoid conflicts with the default User.user_permissions field.
    This related_name is unique, so there’s no conflict with Django's built-in User model.
    Why This Works:

    With unique related_name values, Django can differentiate between the reverse relationships for your custom User model and the built-in User model.
    
    """
    # Custom related names to avoid conflicts
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_set",
        blank=True,
        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_set",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return (
            f"{self.email} with username {self.username} created on {self.date_joined}"
        )


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    picture = models.ImageField(upload_to="profile_pic", blank=True, null=True)

    def __str__(self):
        return f"{self.user.email}'s profile"
