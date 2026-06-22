from datetime import timedelta

from django.db.models import Q
from django.db.models.aggregates import Count
from django.utils import timezone

from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser

from models import Payment
from models.payments import SubscriptionPlan
from serializers import PaymentModelSerializer, SubscriptionModelSerializer
from .models import Quiz, QuizAttempt, Flashcard, Lobby, Document, GenerationRequest
from apps.models.users import User
from .serializers import (
    QuizAttemptSerializer, QuizSerializer, FlashcardSerializer,
    LobbySerializer, DocumentSerializer, GenerationRequestSerializer,
    UserSerializer
)


class UserModelViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(id=self.request.user.id)


class QuizModelViewSet(ModelViewSet):
    queryset = Quiz.objects.all().order_by('-created_on')
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class QuizAttemptModelViewSet(ModelViewSet):
    queryset = QuizAttempt.objects.all().order_by('-completed_at')
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)


class FlashcardModelViewSet(ModelViewSet):
    queryset = Flashcard.objects.all().order_by('order')
    serializer_class = FlashcardSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class LobbyModelViewSet(ModelViewSet):
    queryset = Lobby.objects.all().order_by('-created_at')
    serializer_class = LobbySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated:
            return qs.filter(is_public=True) | qs.filter(host=self.request.user)
        return qs.filter(is_public=True)


class DocumentModelViewSet(ModelViewSet):
    queryset = Document.objects.all().order_by('-uploaded_at')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)


class GenerationRequestModelViewSet(ModelViewSet):
    queryset = GenerationRequest.objects.all().order_by('-created_at')
    serializer_class = GenerationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)


class PaymentModelViewSet(ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)


class SubscriptionPlanModelViewSet(ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        last_24_hour = timezone.now() - timedelta(hours=24)

        return qs.annotate(today_sales=Count('payments', filter=Q(payments__created_at__gte=last_24_hour)))
