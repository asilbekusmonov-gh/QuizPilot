from django.db.models import Model, ForeignKey, CASCADE, TextChoices
from django.db.models.fields import CharField, BooleanField, IntegerField, DateTimeField


class Lobby(Model):
    class StatusChoices(TextChoices):
        WAITING = 'waiting', 'Waiting'
        PLAYING = 'playing', 'Playing'
        FINISHED = 'finished', 'Finished'

    host = ForeignKey("apps.User", on_delete=CASCADE, related_name='hosted_lobbies')
    quiz = ForeignKey("apps.Quiz", on_delete=CASCADE, related_name='lobbies')
    is_public = BooleanField(default=True)
    join_code = CharField(max_length=6, unique=True, null=True, blank=True)
    total_time = IntegerField(default=10)
    status = CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.WAITING)
    teacher_mode = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)


class LobbyParticipant(Model):
    lobby = ForeignKey("apps.Lobby", on_delete=CASCADE, related_name='participants')
    user = ForeignKey("apps.User", on_delete=CASCADE, related_name='lobby_participations')
    score = IntegerField(default=0)
    joined_at = DateTimeField(auto_now_add=True)
