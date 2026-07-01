import os

import fitz  # PyMuPDF
import warnings

# Suppress the deprecation warning from the old SDK to keep console clean
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")
import google.generativeai as genai  # noqa: E402

api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini
genai.configure(api_key=api_key)
model = genai.GenerativeModel(
    'gemini-flash-lite-latest',
    generation_config={"response_mime_type": "application/json"}
)


def extract_text_from_pdf(file_path):
    """Extracts text from a given PDF file."""
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text


def detect_question_count_from_text(text):
    """Sends the text to Gemini for a fast estimation of how many questions can be generated."""
    prompt = f"""
    Read the following text. Estimate how many good, distinct multiple-choice questions can be created from this content.
    Return ONLY a single integer number. Do not return any other text.
    
    Text: {text[:10000]} # Limit to 10,000 chars for speed
    """
    try:
        response = model.generate_content(prompt)
        count = int(response.text.strip())
        # Cap at 50 to prevent crazy values
        return min(max(count, 1), 50)
    except Exception as e:
        print("Error detecting question count:", e)
        return 10  # Default fallback


def generate_quiz_from_text(text, num_questions=10):
    """Sends the text to Gemini and asks for a JSON quiz."""

    prompt = f"""
    Read the following text and generate exactly {num_questions} multiple-choice questions.
    Return ONLY a JSON array with this exact structure:
    [{{ "question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "B" }}]
    
    Text: {text[:10000]}
    """
    response = model.generate_content(prompt)
    return response.text


def generate_flashcards_from_text(text, num_cards=10):
    """Sends the text to Gemini and asks for a JSON array of flashcards."""

    prompt = f"""
    Read the following text and generate exactly {num_cards} distinct flashcards to help study this material.
    Extract the most important concepts, terms, or facts.
    Return ONLY a JSON array with this exact structure:
    [{{ "front": "Concept or Term", "back": "Definition or Explanation" }}]
    
    Text: {text[:10000]}
    """
    response = model.generate_content(prompt)
    return response.text


def generate_slides_from_text(text, num_slides=10):
    """Sends the text to Gemini and asks for a JSON array of presentation slides."""

    prompt = f"""
    Read the following text and generate exactly {num_slides} presentation slides.
    Each slide should have a title and content (use markdown bullet points for the content to make it readable on a screen).
    Return ONLY a JSON array with this exact structure:
    [{{ "title": "Slide Title", "content": "- Bullet 1\\n- Bullet 2" }}]
    
    Text: {text[:10000]}
    """
    response = model.generate_content(prompt)
    return response.text
