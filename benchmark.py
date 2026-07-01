import os
import time

from dotenv import load_dotenv
load_dotenv(".env")
import google.generativeai as genai  # noqa: E402
import warnings  # noqa: E402
warnings.filterwarnings("ignore")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

text = "The quick brown fox jumps over the lazy dog. The capital of France is Paris." * 50

prompt = f"""
Generate exactly 30 multiple-choice questions.
Return ONLY JSON array of objects: {{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "A"}}
Text: {text}
"""

for model_name in ['gemini-flash-latest', 'gemini-flash-lite-latest']:
    model = genai.GenerativeModel(model_name)
    start = time.time()
    resp = model.generate_content(prompt)
    duration = time.time() - start
    print(f"{model_name} took {duration:.2f} seconds. Output length: {len(resp.text)}")

