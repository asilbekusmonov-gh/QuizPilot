from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import QuizAttemptModelViewSet, QuizModelViewSet

router = DefaultRouter()
router.register(r'quizzes', QuizModelViewSet, basename='quiz')
router.register(r'attempts', QuizAttemptModelViewSet, basename='attempt')

urlpatterns = [
    path('', include(router.urls)),
]