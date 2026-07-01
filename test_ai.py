import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'root.settings')
django.setup()

from apps.ai_service import detect_question_count_from_text, generate_quiz_from_text
text = "The quick brown fox jumps over the lazy dog. The capital of France is Paris."
print("Detecting count...")
count = detect_question_count_from_text(text)
print(f"Detected count: {count}")

print("Generating quiz...")
quiz = generate_quiz_from_text(text, num_questions=2)
print(f"Quiz JSON:\n{quiz}")
