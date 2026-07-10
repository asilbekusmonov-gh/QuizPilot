import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'root.settings')
django.setup()

from apps.models.payments import SubscriptionPlan

plans = [
    {
        "name": "1 kunlik",
        "duration_days": 1,
        "price": 7900,
        "order": 1
    },
    {
        "name": "7 kunlik",
        "duration_days": 7,
        "price": 19900,
        "order": 2
    },
    {
        "name": "30 kunlik",
        "duration_days": 30,
        "price": 49900,
        "order": 3
    },
    {
        "name": "Ustozlar",
        "duration_days": 365,
        "price": 99900,
        "order": 4
    }
]

for plan in plans:
    obj, created = SubscriptionPlan.objects.get_or_create(
        name=plan['name'],
        defaults={
            'duration_days': plan['duration_days'],
            'price': plan['price'],
            'order': plan['order']
        }
    )
    if created:
        print(f"Created plan: {obj.name}")
    else:
        print(f"Plan already exists: {obj.name}")

print(f"Total plans in DB: {SubscriptionPlan.objects.count()}")
