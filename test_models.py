import os
from dotenv import load_dotenv
load_dotenv(".env")
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
print("API KEY:", os.getenv("GEMINI_API_KEY")[:5] + "...")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
