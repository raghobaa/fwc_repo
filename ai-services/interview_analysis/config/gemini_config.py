from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API with new google.genai SDK
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
_client = genai.Client(api_key=GEMINI_API_KEY)

# Model to use — gemini-1.5-flash has 1,500 req/day on the free tier
_MODEL = "gemini-2.5-flash"

# Thin wrapper so existing code calling model.generate_content(prompt) keeps working
class _ModelWrapper:
    def generate_content(self, prompt: str):
        response = _client.models.generate_content(
            model=_MODEL,
            contents=prompt,
        )
        # Expose a .text attribute matching the old SDK's response shape
        class _Resp:
            text = response.text
        return _Resp()

model = _ModelWrapper()

# Interview Configuration
INTERVIEW_DURATION_MINUTES = 15  # Fixed interview duration
QUESTION_INTERVAL_SECONDS = 30   # Time between questions
SCORING_CRITERIA = {
    "technical_knowledge": 30,
    "communication_skills": 25,
    "problem_solving": 20,
    "experience_relevance": 15,
    "confidence": 10
}

# Voice Configuration
VOICE_SETTINGS = {
    "speech_rate": 150,  # Words per minute
    "voice_volume": 0.8,
    "voice_id": 0  # Default voice
}

# Interview Prompts
INTERVIEW_PROMPTS = {
    "opening": """
    Welcome to your AI-powered interview! I'm your AI interviewer. 
    This interview will last approximately {duration} minutes and will consist of several questions.
    Please speak clearly and take your time to answer each question thoughtfully.
    Are you ready to begin?
    """,
    
    "scoring_prompt": """
    Based on the candidate's response, evaluate them on the following criteria (0-10 scale):
    1. Technical Knowledge: How well did they demonstrate understanding of the subject?
    2. Communication Skills: How clear and articulate was their response?
    3. Problem Solving: How well did they approach and solve problems?
    4. Experience Relevance: How relevant was their experience to the question?
    5. Confidence: How confident and professional did they sound?
    
    Candidate's response: {response}
    Question asked: {question}
    
    Provide scores for each criterion and a brief explanation for each score.
    """,
    
    "final_evaluation": """
    Based on all the candidate's responses during this interview, provide a comprehensive evaluation:
    
    Interview Summary: {interview_summary}
    
    Please provide:
    1. Overall score (0-100)
    2. Strengths identified
    3. Areas for improvement
    4. Recommendation (HIRE/NO HIRE/MAYBE)
    5. Detailed feedback
    """
}
