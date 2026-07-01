from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    QuizAttemptModelViewSet, QuizModelViewSet,
    FlashcardModelViewSet, LobbyModelViewSet,
    DocumentModelViewSet, GenerationRequestModelViewSet,
    UserModelViewSet, SubscriptionPlanModelViewSet, PaymentModelViewSet, PublicViewSet,
    QuestionModelViewSet, OptionModelViewSet, SlideModelViewSet, TelegramAuthView
)

router = DefaultRouter()
router.register(r'users', UserModelViewSet, basename='user')
router.register(r'quizzes', QuizModelViewSet, basename='quiz')
router.register(r'attempts', QuizAttemptModelViewSet, basename='attempt')
router.register(r'flashcards', FlashcardModelViewSet, basename='flashcard')
router.register(r'lobbies', LobbyModelViewSet, basename='lobby')
router.register(r'documents', DocumentModelViewSet, basename='document')
router.register(r'generations', GenerationRequestModelViewSet, basename='generation')
router.register(r'subscriptions', SubscriptionPlanModelViewSet, basename='subscription')
router.register(r'payments', PaymentModelViewSet, basename='payment')
router.register(r'public', PublicViewSet, basename='public')
router.register(r'questions', QuestionModelViewSet, basename='question')
router.register(r'options', OptionModelViewSet, basename='option')
router.register(r'slides', SlideModelViewSet, basename='slide')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/telegram/', TelegramAuthView.as_view(), name='auth-telegram'),
]

# kth34ktg34ighri34h
