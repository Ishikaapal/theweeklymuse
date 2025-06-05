from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import time
from django.utils.timezone import now

# Create your models here.

#Task Model
class Task(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField()
    status = models.CharField(max_length=25,default='Incomplete')
    date = models.DateField(auto_now_add=True)
    finishDate = models.DateField(null=True, blank=True)
    start_time=models.TimeField()
    end_time=models.TimeField()
    priority=models.CharField(max_length=25,default='Unmark')
    username=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)


class Profile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    fname = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    profile_pic =models.ImageField(upload_to='profile',default='profile/default.svg')

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        full_name = f"{instance.first_name} {instance.last_name}".strip()
        Profile.objects.create(
            user=instance, 
            email=instance.email, 
            fname=full_name if full_name else instance.username
        )

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()