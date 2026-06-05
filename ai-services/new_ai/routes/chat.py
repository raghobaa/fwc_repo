from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os

from services.vector_search import vector_search

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

CHAT_MODEL = "gemini-2.5-flash"  # Free tier model


class ChatRequest(BaseModel):
    message: str
    top_k: int = 5  # Number of resumes to retrieve


class ChatResponse(BaseModel):
    answer: str
    matched_resumes: list[dict]


@router.post("/chat", response_model=ChatResponse)
async def hr_chat(request: ChatRequest):
    """
    HR Chatbot endpoint.
    1. Vector search for relevant resumes
    2. Pass matches as context to Gemini
    3. Return answer + matched resumes
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Step 1: Find relevant resumes via vector search
    try:
        matched_resumes = vector_search(request.message, top_k=request.top_k)
        print("Matched resumes:", len(matched_resumes))
    except Exception as e:
        print("VECTOR SEARCH ERROR:", e)
        raise
    if not matched_resumes:
        return ChatResponse(
            answer="I couldn't find any matching resumes for your query. Please make sure resumes have been uploaded.",
            matched_resumes=[]
        )

    # Step 2: Build context from matched resumes
    context_parts = []
    for i, resume in enumerate(matched_resumes, 1):
        candidate = resume.get("candidate_name", resume.get("filename", f"Candidate {i}"))
        preview = resume.get("text_preview", "No preview available")
        score = resume.get("score", 0)
        context_parts.append(
            f"**Candidate {i}: {candidate}**\n"
            f"Relevance Score: {score:.2f}\n"
            f"Resume Excerpt:\n{preview}\n"
        )

    context = "\n---\n".join(context_parts)

    # Step 3: Build prompt for Gemini
    prompt = f"""You are an HR assistant helping a recruiter find the right candidates.

The recruiter asked: "{request.message}"

Based on the following resume excerpts, provide a helpful summary of the most relevant candidates:

{context}

Instructions:
- Summarize which candidates best match the query and why
- Highlight relevant skills, experience, or qualifications
- Be concise and professional
- If none seem relevant, say so honestly
- List candidate names clearly
"""

    # Step 4: Call Gemini
    try:
        model = genai.GenerativeModel(CHAT_MODEL)
        response = model.generate_content(prompt)
        answer = response.text
    except Exception as e:
        print("GEMINI ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    return ChatResponse(
        answer=answer,
        matched_resumes=matched_resumes
    )
