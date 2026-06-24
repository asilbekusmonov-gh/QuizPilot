from datetime import timedelta

from django.db.models import Q
from django.db.models.aggregates import Count
from django.utils import timezone

from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.response import Response
from rest_framework import status
import json

from .models.payments import Payment, SubscriptionPlan
from .serializers import PaymentModelSerializer, SubscriptionModelSerializer
from .models import Quiz, Question, Option, QuizAttempt, Flashcard, Lobby, Document, GenerationRequest
from apps.ai_service import extract_text_from_pdf, generate_quiz_from_text
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

    def create(self, request, *args, **kwargs):
        # 1. Save the Document normally using the serializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = serializer.save(user=request.user)
        
        try:
            # 2. Extract text from the newly saved PDF
            file_path = document.file.path
            from apps.ai_service import extract_text_from_pdf, detect_question_count_from_text
            pdf_text = extract_text_from_pdf(file_path)
            
            # 3. Detect number of questions
            detected_count = detect_question_count_from_text(pdf_text)
            document.detected_question_count = detected_count
            document.save()
            
            return Response({
                "message": "File analyzed successfully!",
                "detected_count": detected_count,
                "document": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                "error": str(e),
                "document": serializer.data
            }, status=status.HTTP_400_BAD_REQUEST)

    from rest_framework.decorators import action
    
    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        document = self.get_object()
        num_questions = int(request.data.get('num_questions', 10))
        quiz_name = request.data.get('quiz_name', document.file_name)
        
        from apps.tasks import generate_quiz_background
        
        # Trigger celery task
        task = generate_quiz_background.delay(document.id, num_questions, quiz_name)
        
        document.task_id = task.id
        document.status = 'generating'
        document.save()
        
        return Response({
            "message": "Quiz generation started",
            "task_id": task.id,
            "document_id": document.id
        })


class GenerationRequestModelViewSet(ModelViewSet):
    queryset = GenerationRequest.objects.all()
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
