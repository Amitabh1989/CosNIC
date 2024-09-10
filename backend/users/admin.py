from django.contrib import admin

from .models import User, UserProfile

# Register your models here.


class UserAdmin(admin.ModelAdmin):
    list_display = ["id", "username", "email", "is_staff", "is_active"]
    list_display_links = ["id", "username"]


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "location", "avatar", "nickname"]
    list_display_links = ["id", "user"]


admin.site.register(User, UserAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
