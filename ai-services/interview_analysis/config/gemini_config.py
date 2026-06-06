import os
from dotenv import load_dotenv

load_dotenv()

# Dummy model (No Gemini Required)

class DummyResponse:
    def __init__(self, text):
        self.text = text

class DummyModel:
    def generate_content(self, prompt):

        prompt = str(prompt).lower()

        # Scoring response
        if "technical knowledge" in prompt:
            return DummyResponse("""
Technical Knowledge: 8
Communication Skills: 8
Problem Solving: 7
Experience Relevance: 8
Confidence: 8

Candidate demonstrated good understanding and communication.
""")

        # Final evaluation response
        if "overall score" in prompt:
            return DummyResponse("""
Overall Score: 80

Strengths:
- Good communication
- Relevant experience
- Positive attitude

Areas for Improvement:
- More technical depth
- More project examples

Recommendation: HIRE

Detailed Feedback:
Candidate performed well and is suitable for the role.
""")

        return DummyResponse("Interview completed successfully.")

# Use dummy model instead of Gemini
model = DummyModel()

INTERVIEW_DURATION_MINUTES = 15

QUESTION_INTERVAL_SECONDS = 30

SCORING_CRITERIA = {
    "technical_knowledge": 30,
    "communication_skills": 25,
    "problem_solving": 20,
    "experience_relevance": 15,
    "confidence": 10
}

VOICE_SETTINGS = {
    "speech_rate": 150,
    "voice_volume": 0.8,
    "voice_id": 0
}

INTERVIEW_PROMPTS = {
    "opening": """
Welcome to your AI-powered interview.
This interview will last approximately {duration} minutes.
Are you ready to begin?
""",

    "scoring_prompt": """
Evaluate candidate response:

Response: {response}
Question: {question}
""",

    "final_evaluation": """
Interview Summary:
{interview_summary}
"""
}