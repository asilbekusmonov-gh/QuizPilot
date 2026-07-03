from django.contrib.auth.models import AbstractUser
from django.db.models import IntegerField


class User(AbstractUser):
    credits = IntegerField(default=5)

    @property
    def has_active_subscription(self):
        from django.utils import timezone
        return self.subscription.filter(is_active=True, expiry_date__gte=timezone.now().date()).exists()

    def __str__(self):
        return self.username
