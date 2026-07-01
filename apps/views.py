from datetime import timedelta

from django.conf import settings
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from apps.telegram_utils import validate_telegram_data
from django.db.models import Q
from django.db.models.aggregates import Count
from django.utils import timezone
from rest_framework import permissions
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, mixins
from rest_framework.decorators import action
import random
import string

from apps.models.users import User
from .models import Quiz, QuizAttempt, Flashcard, Lobby, Document, GenerationRequest, Public, LobbyParticipant, Question, Option, Slide
from .models.payments import Payment, SubscriptionPlan
from .serializers import PaymentModelSerializer, SubscriptionModelSerializer
from .serializers import (
    QuizAttemptSerializer, QuizSerializer, FlashcardSerializer,
    LobbySerializer, DocumentSerializer, GenerationRequestSerializer,
    UserSerializer, PublicSerializer, PublicCreateSerializer,
    QuestionSerializer, OptionSerializer, SlideSerializer
)


class UserModelViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.ListModelMixin,
                       viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(id=self.request.user.id)


class QuizModelViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Quiz.objects.all().order_by('-created_on')
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class QuestionModelViewSet(mixins.UpdateModelMixin, mixins.DestroyModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(quiz__created_by=self.request.user)


class OptionModelViewSet(mixins.UpdateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(question__quiz__created_by=self.request.user)


class PublicViewSet(mixins.CreateModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Public.objects.all().order_by('-id')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return PublicCreateSerializer
        return PublicSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category', None)
        mine = self.request.query_params.get('mine', None)

        if category and category != 'All':
            qs = qs.filter(title=category)

        if mine == 'true' and self.request.user.is_authenticated:
            qs = qs.filter(quiz__created_by=self.request.user)

        return qs

    def create(self, request, *args, **kwargs):
        # Allow creating multiple at once if it's a list
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return super().create(request, *args, **kwargs)


class QuizAttemptModelViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                              mixins.DestroyModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = QuizAttempt.objects.all().order_by('-completed_at')
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)


class FlashcardModelViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                            mixins.DestroyModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Flashcard.objects.all().order_by('order')
    serializer_class = FlashcardSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class SlideModelViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                        mixins.DestroyModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Slide.objects.all().order_by('order')
    serializer_class = SlideSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]



class LobbyModelViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                        mixins.DestroyModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Lobby.objects.all().order_by('-created_at')
    serializer_class = LobbySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated:
            return qs.filter(is_public=True) | qs.filter(host=self.request.user)
        return qs.filter(is_public=True)

    def perform_create(self, serializer):
        join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        # Ensure it's unique (simplified for MVP)
        while Lobby.objects.filter(join_code=join_code).exists():
            join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        serializer.save(host=self.request.user, join_code=join_code)

    @action(detail=False, methods=['post'])
    def join(self, request):
        join_code = request.data.get('join_code')
        if not join_code:
            return Response({'error': 'Join code is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lobby = Lobby.objects.get(join_code=join_code.upper())
            # Prevent duplicate joins
            if not LobbyParticipant.objects.filter(lobby=lobby, user=request.user).exists():
                LobbyParticipant.objects.create(lobby=lobby, user=request.user)
            return Response({'lobby_id': lobby.id})
        except Lobby.DoesNotExist:
            return Response({'error': 'Invalid join code'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        lobby = self.get_object()
        if lobby.host != request.user:
            return Response({'error': 'Only host can start the session'}, status=status.HTTP_403_FORBIDDEN)

        lobby.status = Lobby.StatusChoices.PLAYING
        lobby.save()
        return Response({'status': 'playing'})


class DocumentModelViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin,
                           mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Document.objects.all().order_by('-uploaded_at')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

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
        gen_type = request.data.get('type', 'quiz')

        from apps.tasks import generate_quiz_background, generate_flashcards_background, generate_slides_background

        try:
            # Run generation synchronously to avoid needing celery/redis locally
            if gen_type in ['flashcard', 'flashcards']:
                generate_flashcards_background(document.id, num_questions, quiz_name)
            elif gen_type in ['slide', 'slides']:
                generate_slides_background(document.id, num_questions, quiz_name)
            else:
                generate_quiz_background(document.id, num_questions, quiz_name)

            # document status is updated inside the task
            document.refresh_from_db()

            return Response({
                "message": f"Successfully generated {gen_type}",
                "document_id": document.id
            })
        except Exception as e:
            return Response({
                "error": f"Failed to generate {gen_type}: " + str(e),
                "detail": "This is often due to an API rate limit. Please try again in a few seconds."
            }, status=400)


class GenerationRequestModelViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin,
                                    mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = GenerationRequest.objects.all()
    serializer_class = GenerationRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)


class PaymentModelViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.ListModelMixin,
                          viewsets.GenericViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)


class SubscriptionPlanModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        last_24_hour = timezone.now() - timedelta(hours=24)

        return qs.annotate(today_sales=Count('payments', filter=Q(payments__created_at__gte=last_24_hour)))



class TelegramAuthView(APIView):
    permission_classes = []
    
    def post(self, request):
        init_data = request.data.get('initData')
        if not init_data:
            return Response({"error": "initData is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        tg_user_data = validate_telegram_data(init_data, settings.TELEGRAM_BOT_TOKEN)
        # Fallback for local testing if needed: if not tg_user_data and settings.DEBUG: 
        if not tg_user_data:
            return Response({"error": "Invalid Telegram data"}, status=status.HTTP_403_FORBIDDEN)
            
        tg_id = tg_user_data.get('id')
        if not tg_id:
            return Response({"error": "Telegram ID not found"}, status=status.HTTP_400_BAD_REQUEST)
            
        username = f"tg_{tg_id}"
        
        # Get or create user
        user, created = User.objects.get_or_create(username=username)
        if created:
            user.first_name = tg_user_data.get('first_name', '')
            user.last_name = tg_user_data.get('last_name', '')
            user.save()
            
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'credits': user.credits
            }
        })

