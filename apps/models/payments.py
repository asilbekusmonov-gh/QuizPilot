from django.db.models import Model, CASCADE, ForeignKey, IntegerField
from django.db.models.fields import CharField, BooleanField, DateField, DateTimeField


class Payment(Model):
    user = ForeignKey("apps.User", on_delete=CASCADE, related_name='subscription')
    plan = ForeignKey('apps.SubscriptionPlan', on_delete=CASCADE, related_name='payments', null=True, blank=True)
    is_active = BooleanField(default=True)
    expiry_date = DateField()
    created_at = DateTimeField(auto_now_add=True)


class SubscriptionPlan(Model):
    name = CharField(max_length=50, help_text="Masalan: 1 kunlik, 1 oylik")
    duration_days = IntegerField(help_text="Tarif muddati (kun hisobida, masalan 1, 30, 365)")
    price = IntegerField(help_text="Narxi (so'mda)")
    is_active = BooleanField(default=True, help_text="Saytda ko'rinishi/ko'rinmasligi")
    order = IntegerField(default=0, help_text="Saytda ketma-ketlikda qaysi birinchi chiqishi")

    def __str__(self):
        return f"{self.name} - {self.price} so'm"
