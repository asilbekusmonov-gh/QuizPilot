from rest_framework import permissions
from rest_framework.viewsets import ModelViewSet

from .models import Quiz, QuizAttempt
from .serializers import QuizAttemptSerializer, QuizSerializer


class QuizModelViewSet(ModelViewSet):
    queryset = Quiz.objects.all().order_by('-created_on')
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class QuizAttemptModelViewSet(ModelViewSet):
    queryset = QuizAttempt.objects.all().order_by('-completed_at')
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
