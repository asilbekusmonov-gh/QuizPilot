import os
from dotenv import load_dotenv
load_dotenv(".env")
import google.generativeai as genai  # noqa: E402
import warnings  # noqa: E402
warnings.filterwarnings("ignore")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

models = ['gemini-flash-latest', 'gemini-flash-lite-latest']
for m in models:
    try:
        model = genai.GenerativeModel(m)
        resp = model.generate_content("Hi")
        print(f"Success with {m}: {resp.text.strip()}")
    except Exception as e:
        print(f"Failed with {m}: {type(e).__name__} - {str(e)[:100]}...")
