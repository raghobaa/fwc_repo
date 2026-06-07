#!/usr/bin/env bash
set -e

# Create logs directory if it doesn't exist
mkdir -p /Users/raghav/Downloads/fwc_proj/logs

echo "🚀 Starting all services... Logs will be written to /Users/raghav/Downloads/fwc_proj/logs/"

# Backend (port as defined in its .env / config)
(cd /Users/raghav/Downloads/fwc_proj/backend && npm run start > /Users/raghav/Downloads/fwc_proj/logs/backend.log 2>&1) &
echo "  - Main Backend starting (logs/backend.log)"

# Frontend (React dev server, typically http://localhost:3000)
(cd /Users/raghav/Downloads/fwc_proj/frontend && npm start > /Users/raghav/Downloads/fwc_proj/logs/frontend.log 2>&1) &
echo "  - React Frontend starting (logs/frontend.log)"

# Resume‑Screening service (Flask, default port 5001)
(cd /Users/raghav/Downloads/fwc_proj/ai-services/resume_screening && PORT=5001 ../.venv/bin/python resume_screening_flask.py > /Users/raghav/Downloads/fwc_proj/logs/resume_screening.log 2>&1) &
echo "  - Resume Screening service starting on port 5001 (logs/resume_screening.log)"

# Interview (AI) service (Flask, default port 5004)
(cd /Users/raghav/Downloads/fwc_proj/ai-services/interview_analysis && ../.venv/bin/python web_app.py > /Users/raghav/Downloads/fwc_proj/logs/interview_analysis.log 2>&1) &
echo "  - Interview service starting on port 5004 (logs/interview_analysis.log)"

# HR Bot Flask service (runs on port 6000)
(cd /Users/raghav/Downloads/fwc_proj/ai-services/hrbot && ../.venv/bin/python app.py > /Users/raghav/Downloads/fwc_proj/logs/hrbot.log 2>&1) &
echo "  - HR Bot Flask service starting on port 6000 (logs/hrbot.log)"

# Chatbot gateway/server (runs on port 5011)
(cd /Users/raghav/Downloads/fwc_proj/backend && npm run chatbot > /Users/raghav/Downloads/fwc_proj/logs/chatbot_gateway.log 2>&1) &
echo "  - Chatbot gateway starting on port 5011 (logs/chatbot_gateway.log)"

# Resume AI Chatbot service (FastAPI, default port 5009)
(cd /Users/raghav/Downloads/fwc_proj/ai-services/new_ai && .venv/bin/python main.py > /Users/raghav/Downloads/fwc_proj/logs/new_ai.log 2>&1) &
echo "  - Resume AI Chatbot starting on port 5009 (logs/new_ai.log)"

echo "💡 All services launched. Use 'tail -f logs/<service_name>.log' to view logs."

# Wait for all background jobs (optional – press Ctrl+C to stop everything)
wait
