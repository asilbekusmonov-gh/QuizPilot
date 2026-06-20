from django.db.models import Model, CASCADE, ForeignKey
from django.db.models.fields import CharField, BooleanField, DateField, DateTimeField

from root import settings


class Payment(Model):
    user = ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, related_name='subscription')
    plan_name = CharField(max_length=50)
    is_active = BooleanField(default=True)
    expiry_date = DateField()
    created_at = DateTimeField(auto_now_add=True)
