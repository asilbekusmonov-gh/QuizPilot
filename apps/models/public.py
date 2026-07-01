from django.db.models import Model, CharField, ForeignKey, CASCADE


class Public(Model):
    title = CharField(max_length=100)
    quiz = ForeignKey("apps.Quiz", CASCADE, related_name='public_participants')
