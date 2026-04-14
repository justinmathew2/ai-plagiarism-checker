from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
from PyPDF2 import PdfReader
from docx import Document

from database import init_db, save_analysis, get_analysis, get_all_history, get_settings, update_settings, clear_history

app = FastAPI(title="JustInSight AI Backend", version="1.0.0")

# Setup CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
def startup_event():
    init_db()

class SettingsUpdate(BaseModel):
    plagiarism_threshold: int
    ai_threshold: int

def extract_text(file: UploadFile, file_bytes: bytes) -> str:
    text = ""
    filename = file.filename.lower()
    
    try:
        if filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        elif filename.endswith(".docx"):
            doc = Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            text = file_bytes.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error extracting text: {e}")
        text = "Could not parse document."
        
    return text

def analyze_text(text: str):
    if not GOOGLE_API_KEY:
        print("Warning: GOOGLE_API_KEY not set. Using fallback.")
        return 0, 0, [{"type": "ai", "text": "API Key missing", "details": "Configure GOOGLE_API_KEY", "rewrite": "Add key to proceed."}]
        
    prompt = f"""You are an academic integrity analysis system.

Analyze the following text and return STRICT JSON:

{{
  "plagiarism_score": number (0-100),
  "ai_score": number (0-100),
  "suggestions": [
    {{
      "type": "plagiarism" or "ai",
      "text": "problematic text",
      "details": "what is wrong",
      "rewrite": "improved version"
    }}
  ]
}}

The analysis should:
- Identify AI-like writing patterns
- Detect possible paraphrased or reused content
- Provide actionable rewrite suggestions

Text:
{text}

IMPORTANT: Your ENTIRE response must be valid parseable JSON. Do not include markdown codeblocks. Properly escape any interior double-quotes within your string values. Do not use unescaped line breaks."""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        # Safely log the response avoiding charmap errors on Windows
        try:
            print("Raw Gemini Response received.")
            # Only print if we can handle the terminal encoding, else skip or replace
            print(response.text.encode('ascii', errors='replace').decode('ascii'))
        except:
            print("[Response logged but contained special characters]")

        
        # Clean response if it contains markdown JSON block
        json_str = response.text.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:-3].strip()
        elif json_str.startswith("```"):
            json_str = json_str[3:-3].strip()
            
        data = json.loads(json_str)
        print("Parsed JSON Data:", data)
        
        plagiarism_score = data.get("plagiarism_score", 0)
        ai_score = data.get("ai_score", 0)
        suggestions = data.get("suggestions", [])
        
        return plagiarism_score, ai_score, suggestions
    except Exception as e:
        print(f"Error during API call: {e}")
        return 0, 0, [{"type": "ai", "text": "API Call Failed", "details": str(e), "rewrite": "Try again later."}]


@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...), username: str = Form("Guest")):
    if not file.filename.endswith((".pdf", ".docx", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, or TXT files are accepted.")
    
    file_bytes = await file.read()
    text = extract_text(file, file_bytes)
    
    # Run analysis
    plagiarism_score, ai_score, suggestions = analyze_text(text)
    
    # Save properly to our SQLite db
    result = save_analysis(
        filename=file.filename,
        plagiarism_score=plagiarism_score,
        ai_score=ai_score,
        suggestions=suggestions,
        username=username
    )
    
    # Return original text so UI can highlight it
    result['text'] = text
    return result

@app.get("/history")
def get_history(username: str = "Guest"):
    return get_all_history(username)

@app.get("/history/{id}")
def get_history_by_id(id: int):
    result = get_analysis(id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result

@app.delete("/history")
def delete_all_history(username: str = "Guest"):
    clear_history(username)
    return {"status": "History cleared"}

@app.get("/settings")
def read_settings():
    return get_settings()

@app.post("/settings")
def update_user_settings(settings: SettingsUpdate):
    return update_settings(settings.plagiarism_threshold, settings.ai_threshold)
