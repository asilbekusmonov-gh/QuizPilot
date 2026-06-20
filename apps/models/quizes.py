from django.db.models import Model, ForeignKey, CASCADE
from django.db.models.fields import CharField, TextField, BooleanField, DateTimeField, IntegerField
from django.conf import settings


class Quiz(Model):
    title = CharField(max_length=55)
    description = TextField()
    created_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE)
    is_public = BooleanField(default=True)
    created_on = DateTimeField(auto_now_add=True)


class Question(Model):
    quiz = ForeignKey("apps.Quiz", on_delete=CASCADE, related_name='questions')
    text = TextField()
    order = IntegerField()


class Option(Model):
    question = ForeignKey("apps.Question", on_delete=CASCADE, related_name='options')
    text = TextField()
    is_correct = BooleanField(default=False)


class QuizAttempt(Model):
    user = ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, related_name='quiz_attempts')
    quiz = ForeignKey("apps.Quiz", on_delete=CASCADE, related_name='quiz_attempts')
    score = IntegerField(default=0)
    completed_at = DateTimeField(auto_now_add=True)
