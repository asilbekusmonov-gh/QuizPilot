import os
import fitz  # PyMuPDF
import google.generativeai as genai
from django.conf import settings
from dotenv import load_dotenv

# Load the .env variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

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
        return 10 # Default fallback

def generate_quiz_from_text(text, num_questions=10):
    """Sends the text to Gemini and asks for a JSON quiz."""
    
    prompt = f"""
    Read the following text and generate exactly {num_questions} multiple-choice questions.
    Return the output STRICTLY in JSON format with this exact structure:
    [{{ "question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "B" }}]
    
    Text: {text[:15000]} # Limit to 15,000 characters for safety
    """
    
    import re
    
    response = model.generate_content(prompt)
    
    # Extract just the JSON part using regex
    match = re.search(r'\[.*\]', response.text, re.DOTALL)
    if match:
        response_text = match.group(0)
    else:
        # Fallback if regex fails
        response_text = response.text.replace('```json', '').replace('```', '').strip()
        
    return response_text
