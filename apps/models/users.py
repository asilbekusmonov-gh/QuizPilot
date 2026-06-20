from django.contrib.auth.models import AbstractUser
from django.db.models import TextChoices, CharField, IntegerField

from .managers import CustomUserManager


class User(AbstractUser):
    class Roles(TextChoices):
        USER = 'user', 'User'
        ADMIN = 'admin', 'Admin'

    role = CharField(max_length=10, choices=Roles.choices, default=Roles.USER)
    credits = IntegerField(default=5)
    objects = CustomUserManager()

    def __str__(self):
        return self.username
