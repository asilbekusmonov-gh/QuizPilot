import json
from celery import shared_task
from apps.models import Document, Quiz, Question, Option
from apps.ai_service import extract_text_from_pdf, generate_quiz_from_text

@shared_task
def generate_quiz_background(document_id, num_questions, quiz_name):
    try:
        document = Document.objects.get(id=document_id)
        document.status = 'generating'
        document.save()

        # 1. Extract text
        file_path = document.file.path
        pdf_text = extract_text_from_pdf(file_path)

        # 2. Call AI to generate quiz
        quiz_json_string = generate_quiz_from_text(pdf_text, num_questions=num_questions)
        quiz_data = json.loads(quiz_json_string)

        # 3. Create database records
        quiz = Quiz.objects.create(
            title=quiz_name or "Generated Quiz",
            description=f"Generated from {document.file_name}",
            created_by=document.user
        )

        for i, q_data in enumerate(quiz_data):
            question = Question.objects.create(
                quiz=quiz,
                text=q_data.get('question'),
                order=i
            )
            
            options = q_data.get('options', [])
            correct_answer = q_data.get('correct_answer')
            
            for option_text in options:
                Option.objects.create(
                    question=question,
                    text=option_text,
                    is_correct=(option_text == correct_answer)
                )

        # 4. Mark document as completed
        document.status = 'completed'
        document.save()

        return {"quiz_id": quiz.id, "message": "Successfully generated quiz"}

    except Exception as e:
        # Mark as failed if anything goes wrong
        if 'document' in locals():
            document.status = 'failed'
            document.save()
        print(f"Celery task failed for document {document_id}: {e}")
        raise e
