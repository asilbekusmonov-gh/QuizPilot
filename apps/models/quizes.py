from django.db.models import Model, ForeignKey, CASCADE
from django.db.models.fields import CharField, TextField, BooleanField, DateTimeField, IntegerField
from django.conf import settings


class Quiz(Model):
    title = CharField(max_length=55)
    description = TextField()
    created_by = ForeignKey("apps.User", on_delete=CASCADE,  related_name='quizzes')
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


class Flashcard(Model):
    quiz = ForeignKey("apps.Quiz", on_delete=CASCADE, related_name='flashcards')
    front = TextField()
    back = TextField()
    order = IntegerField(default=0)


class QuizAttempt(Model):
    user = ForeignKey("apps.User", on_delete=CASCADE, related_name='quiz_attempts')
    quiz = ForeignKey("apps.Quiz", on_delete=CASCADE, related_name='attempts')
    score = IntegerField(default=0)
    completed_at = DateTimeField(auto_now_add=True)
