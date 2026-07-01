from django.db.models import Model, ForeignKey, CASCADE
from django.db.models.fields import CharField, IntegerField, DateTimeField
from django.db.models.fields.files import FileField


class Document(Model):
    user = ForeignKey("apps.User", CASCADE, related_name='documents')
    file = FileField(upload_to='documents/')
    file_name = CharField(max_length=255)
    file_size = IntegerField(default=0)  # size in bytes
    uploaded_at = DateTimeField(auto_now_add=True)

    # AI Tracking
    status = CharField(max_length=50, default='uploaded')  # uploaded, generating, completed, failed
    task_id = CharField(max_length=255, null=True, blank=True)
    detected_question_count = IntegerField(null=True, blank=True)
