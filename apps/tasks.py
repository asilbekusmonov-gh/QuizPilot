import json
from celery import shared_task
from apps.models import Document, Quiz, Question, Option, Flashcard, Slide
from apps.ai_service import extract_text_from_pdf, generate_quiz_from_text, generate_flashcards_from_text, generate_slides_from_text

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


@shared_task
def generate_flashcards_background(document_id, num_cards, quiz_name):
    try:
        document = Document.objects.get(id=document_id)
        document.status = 'generating'
        document.save()

        # 1. Extract text
        file_path = document.file.path
        pdf_text = extract_text_from_pdf(file_path)

        # 2. Call AI to generate flashcards
        cards_json_string = generate_flashcards_from_text(pdf_text, num_cards=num_cards)
        cards_data = json.loads(cards_json_string)

        # 3. Create database records
        quiz = Quiz.objects.create(
            title=quiz_name or "Generated Flashcards",
            description=f"Generated from {document.file_name}",
            created_by=document.user
        )

        for i, c_data in enumerate(cards_data):
            Flashcard.objects.create(
                quiz=quiz,
                front=c_data.get('front'),
                back=c_data.get('back'),
                order=i
            )

        # 4. Mark document as completed
        document.status = 'completed'
        document.save()

        return {"quiz_id": quiz.id, "message": "Successfully generated flashcards"}

    except Exception as e:
        # Mark as failed if anything goes wrong
        if 'document' in locals():
            document.status = 'failed'
            document.save()
        print(f"Celery task failed for document {document_id}: {e}")
        raise e


@shared_task
def generate_slides_background(document_id, num_slides, quiz_name):
    try:
        document = Document.objects.get(id=document_id)
        document.status = 'generating'
        document.save()

        # 1. Extract text
        file_path = document.file.path
        pdf_text = extract_text_from_pdf(file_path)

        # 2. Call AI to generate slides
        slides_json_string = generate_slides_from_text(pdf_text, num_slides=num_slides)
        
        # Clean the string in case the AI wraps it in markdown blocks
        slides_json_string = slides_json_string.replace('```json', '').replace('```', '').strip()
        slides_data = json.loads(slides_json_string)

        # 3. Create database records
        quiz = Quiz.objects.create(
            title=quiz_name or "Generated Slides",
            description=f"Generated from {document.file_name}",
            created_by=document.user
        )

        for i, s_data in enumerate(slides_data):
            Slide.objects.create(
                quiz=quiz,
                title=s_data.get('title', f"Slide {i+1}"),
                content=s_data.get('content', ""),
                order=i
            )

        # 4. Mark document as completed
        document.status = 'completed'
        document.save()

        return {"quiz_id": quiz.id, "message": "Successfully generated slides"}

    except Exception as e:
        # Mark as failed if anything goes wrong
        if 'document' in locals():
            document.status = 'failed'
            document.save()
        print(f"Celery task failed for document {document_id}: {e}")
        raise e
