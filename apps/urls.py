from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    QuizAttemptModelViewSet, QuizModelViewSet,
    FlashcardModelViewSet, LobbyModelViewSet,
    DocumentModelViewSet, GenerationRequestModelViewSet,
    UserModelViewSet
)

router = DefaultRouter()
router.register(r'users', UserModelViewSet, basename='user')
router.register(r'quizzes', QuizModelViewSet, basename='quiz')
router.register(r'attempts', QuizAttemptModelViewSet, basename='attempt')
router.register(r'flashcards', FlashcardModelViewSet, basename='flashcard')
router.register(r'lobbies', LobbyModelViewSet, basename='lobby')
router.register(r'documents', DocumentModelViewSet, basename='document')
router.register(r'generations', GenerationRequestModelViewSet, basename='generation')

urlpatterns = [
    path('', include(router.urls)),
]


# kth34ktg34ighri34h
