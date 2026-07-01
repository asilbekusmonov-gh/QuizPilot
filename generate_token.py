import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'root.settings')
django.setup()

from apps.models.users import User  # noqa: E402
from rest_framework_simplejwt.tokens import RefreshToken  # noqa: E402

try:
    user = User.objects.get(username='asilbek')
    refresh = RefreshToken.for_user(user)
    print(f"\nYour JWT Access Token for 'asilbek' is:\n{refresh.access_token}\n")
    print(f"Login Link for Frontend:\nhttp://localhost:3000/?token={refresh.access_token}\n")
except User.DoesNotExist:
    print("User 'asilbek' not found!")
