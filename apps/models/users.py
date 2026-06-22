from django.contrib.auth.models import AbstractUser
from django.db.models import IntegerField


class User(AbstractUser):
    credits = IntegerField(default=5)

    def __str__(self):
        return self.username
