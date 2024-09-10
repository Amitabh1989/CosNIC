from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User, UserProfile
from .serializers import generate_avatar


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        print(f"Creating profile for new user: {instance}")
        user_profile = UserProfile.objects.create(user=instance)
        if not user_profile.avatar:
            avatar_file = generate_avatar(user_profile.user.username)
            user_profile.avatar.save(avatar_file.name, avatar_file, save=True)
        # return user_profile


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        print(f"Saving profile for user: {instance}")
        instance.profile.save()
    except UserProfile.DoesNotExist:
        print(f"Profile not found for user {instance}, creating new one.")
        UserProfile.objects.create(user=instance)
