from django.contrib import admin
from .models import User, UserProfile
# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_staff', 'is_active']

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'photo']

admin.site.register(User)
admin.site.register(UserProfile)
