from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import uvicorn

load_dotenv()

from routes.upload import router as upload_router
from routes.chat import router as chat_router

app = FastAPI(
    title="HRMS Resume Chatbot API",
    description="Upload resumes and chat with HR AI to find candidates",
    version="1.0.0"
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(upload_router, prefix="/api", tags=["Resume Upload"])
app.include_router(chat_router, prefix="/api", tags=["HR Chatbot"])


@app.get("/")
async def root():
    return {
        "message": "HRMS Chatbot API is running",
        "port": 5009,
        "docs": "http://localhost:5009/docs"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    reload_enabled = os.getenv("UVICORN_RELOAD", "").lower() in {"1", "true", "yes"}
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "5009"))
    uvicorn.run("main:app", host=host, port=port, reload=reload_enabled)
