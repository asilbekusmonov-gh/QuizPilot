import os
import fitz  # PyMuPDF
from docx import Document
from PIL import Image
import warnings

# Suppress the deprecation warning from the old SDK to keep console clean
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")
import google.generativeai as genai  # noqa: E402

api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini
genai.configure(api_key=api_key)
model = genai.GenerativeModel(
    'gemini-1.5-flash',
    generation_config={"response_mime_type": "application/json"}
)

def extract_content(file_path):
    """
    Extracts text from PDF, DOCX, or TXT. 
    If the file is an image (JPG, PNG), it returns a PIL Image object to be passed directly to Gemini.
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.pdf':
        text = ""
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text()
        return text
    elif ext in ['.docx', '.doc']:
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    elif ext in ['.jpg', '.jpeg', '.png']:
        # Return PIL image object for Gemini Vision
        img = Image.open(file_path)
        img.load() # Force load to memory so we don't have closed file issues
        return img
    elif ext == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError(f"Unsupported file extension: {ext}")


def detect_question_count_from_text(content):
    """Sends the content (text or image) to Gemini for estimation."""
    prompt = (
        "Analyze the provided educational material. "
        "Estimate how many good, distinct multiple-choice questions can be created from this content. "
        "Return ONLY a single integer number. Do not return any other text."
    )
    
    try:
        # If content is a string, truncate it only slightly if it's astronomically huge, but 1.5-flash handles a lot.
        # We will pass the full content.
        request_data = [prompt, content]
        response = model.generate_content(request_data)
        count = int(response.text.strip())
        return min(max(count, 1), 100) # Cap at 100
    except Exception as e:
        print("Error detecting question count:", e)
        return 10  # Default fallback


def generate_quiz_from_text(content, num_questions=10):
    """Sends the content to Gemini and asks for a JSON quiz."""

    prompt = f"""
    You are an expert educator. Read the provided educational material and generate exactly {num_questions} multiple-choice questions.
    
    CRITICAL RULES:
    1. The output MUST be in the EXACT SAME LANGUAGE as the source material. If it's in Uzbek, write in Uzbek. If Russian, Russian.
    2. DO NOT invent or hallucinate new questions. Extract information directly from the source.
    3. If the source material is ALREADY a test/quiz, DO NOT modify the wording of the questions or options. Just digitize them exactly as written.
    4. Ensure there is only ONE correct answer for each question.
    
    Return ONLY a JSON array with this exact structure:
    [{{ "question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "B" }}]
    """
    
    response = model.generate_content([prompt, content])
    return response.text


def generate_flashcards_from_text(content, num_cards=10):
    """Sends the content to Gemini and asks for a JSON array of flashcards."""

    prompt = f"""
    Read the provided educational material and generate exactly {num_cards} distinct flashcards to help study this material.
    Extract the most important concepts, terms, or facts.
    
    CRITICAL RULES:
    1. The output MUST be in the EXACT SAME LANGUAGE as the source material.
    2. DO NOT invent information. Use only facts from the text.
    
    Return ONLY a JSON array with this exact structure:
    [{{ "front": "Concept or Term", "back": "Definition or Explanation" }}]
    """
    response = model.generate_content([prompt, content])
    return response.text


def generate_slides_from_text(content, num_slides=10):
    """Sends the content to Gemini and asks for a JSON array of presentation slides."""

    prompt = f"""
    Read the provided educational material and generate exactly {num_slides} presentation slides.
    Each slide should have a title and content (use markdown bullet points for the content to make it readable on a screen).
    
    CRITICAL RULES:
    1. The output MUST be in the EXACT SAME LANGUAGE as the source material.
    
    Return ONLY a JSON array with this exact structure:
    [{{ "title": "Slide Title", "content": "- Bullet 1\\n- Bullet 2" }}]
    """
    response = model.generate_content([prompt, content])
    return response.text

