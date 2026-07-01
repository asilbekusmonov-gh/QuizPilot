from django.db.models import Model, ForeignKey, CASCADE
from django.db.models.fields import TextField, IntegerField, DateTimeField

class GenerationRequest(Model):
    user = ForeignKey("apps.User", on_delete=CASCADE, related_name='generation_requests')
    prompt = TextField()
    num_questions = IntegerField(default=10)
    created_at = DateTimeField(auto_now_add=True)
