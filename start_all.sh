#!/usr/bin/env bash
set -e

# Backend (port as defined in its .env / config)
(cd /Users/raghav/Downloads/fwc_proj/backend && npm run start) &

# Frontend (React dev server, typically http://localhost:3000)
(cd /Users/raghav/Downloads/fwc_proj/frontend && npm start) &

# Resume‑Screening service (Flask, default port 5000)
(cd /Users/raghav/Downloads/fwc_proj/ai-services/resume_screening && ../.venv/bin/python resume_screening_flask.py) &

# Interview (AI) service (Flask, default port 5003)
(cd /Users/raghav/Downloads/fwc_proj/ai-services/interview_analysis && ../.venv/bin/python web_app.py) &

# Chat‑Bot API (Flask wrapper we just added, runs on port 5010)
(cd /Users/raghav/Downloads/fwc_proj/ai-services/chat-bot && ../.venv/bin/python api_chatbot.py) &

# Wait for all background jobs (optional – press Ctrl+C to stop everything)
wait
