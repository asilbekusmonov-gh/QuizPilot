from rest_framework.serializers import CharField, CurrentUserDefault, HiddenField, ModelSerializer

from .models import Option, Question, Quiz, QuizAttempt


class OptionSerializer(ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'options']


class QuizSerializer(ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    created_by_username = CharField(source='created_by.username', read_only=True)
    created_by = HiddenField(default=CurrentUserDefault())

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'created_by', 'created_by_username', 'is_public', 'created_on', 'questions']


class QuizAttemptSerializer(ModelSerializer):
    quiz_title = CharField(source='quiz.title', read_only=True)
    username = CharField(source='user.username', read_only=True)
    user = HiddenField(default=CurrentUserDefault())

    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'username', 'quiz', 'quiz_title', 'score', 'completed_at']
