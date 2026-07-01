from rest_framework.serializers import CharField, CurrentUserDefault, HiddenField, ModelSerializer, IntegerField, \
    SerializerMethodField

from apps.models import User, Payment, SubscriptionPlan, Option, Question, Quiz, QuizAttempt, Flashcard, Lobby, \
    LobbyParticipant, Document, GenerationRequest, Public


class UserSerializer(ModelSerializer):
    quiz_count = SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'credits', 'quiz_count']
        read_only_fields = ['id', 'credits', 'quiz_count']

    def get_quiz_count(self, obj) -> int:
        return obj.quizzes.count()


class OptionSerializer(ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'options']


class FlashcardSerializer(ModelSerializer):
    class Meta:
        model = Flashcard
        fields = ['id', 'front', 'back', 'order']


class QuizSerializer(ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    flashcards = FlashcardSerializer(many=True, read_only=True)
    created_by_username = CharField(source='created_by.username', read_only=True)
    created_by = HiddenField(default=CurrentUserDefault())

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'created_by', 'created_by_username', 'is_public', 'created_on',
                  'questions', 'flashcards']


class PublicSerializer(ModelSerializer):
    quiz_details = QuizSerializer(source='quiz', read_only=True)

    class Meta:
        model = Public
        fields = ['id', 'title', 'quiz', 'quiz_details']


class PublicCreateSerializer(ModelSerializer):
    class Meta:
        model = Public
        fields = ['id', 'title', 'quiz']



class QuizAttemptSerializer(ModelSerializer):
    quiz_title = CharField(source='quiz.title', read_only=True)
    username = CharField(source='user.username', read_only=True)
    user = HiddenField(default=CurrentUserDefault())

    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'username', 'quiz', 'quiz_title', 'score', 'completed_at']


class LobbyParticipantSerializer(ModelSerializer):
    username = CharField(source='user.username', read_only=True)
    user = HiddenField(default=CurrentUserDefault())

    class Meta:
        model = LobbyParticipant
        fields = ['id', 'lobby', 'user', 'username', 'score', 'joined_at']


class LobbySerializer(ModelSerializer):
    participants = LobbyParticipantSerializer(many=True, read_only=True)
    host_username = CharField(source='host.username', read_only=True)
    quiz_title = CharField(source='quiz.title', read_only=True)
    host = HiddenField(default=CurrentUserDefault())

    class Meta:
        model = Lobby
        fields = ['id', 'host', 'host_username', 'quiz', 'quiz_title', 'is_public', 'join_code', 'total_time', 'status',
                  'teacher_mode', 'created_at', 'participants']


class DocumentSerializer(ModelSerializer):
    user = HiddenField(default=CurrentUserDefault())
    file_name = CharField(read_only=True)
    file_size = IntegerField(read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'user', 'file', 'file_name', 'file_size', 'uploaded_at', 'status', 'task_id',
                  'detected_question_count']

    def create(self, validated_data):
        file = validated_data.get('file')
        if file:
            validated_data['file_name'] = file.name
            validated_data['file_size'] = file.size
        return super().create(validated_data)


class GenerationRequestSerializer(ModelSerializer):
    user = HiddenField(default=CurrentUserDefault())

    class Meta:
        model = GenerationRequest
        fields = ['id', 'user', 'prompt', 'num_questions', 'created_at']


class PaymentModelSerializer(ModelSerializer):
    user = HiddenField(default=CurrentUserDefault())

    class Meta:
        model = Payment
        fields = ['id', 'user', 'expiry_date']


class SubscriptionModelSerializer(ModelSerializer):
    today_sales = SerializerMethodField()

    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'duration_days', 'price', 'order', 'today_sales']

    def get_today_sales(self, obj) -> int:
        return getattr(obj, 'today_sales', 0)
