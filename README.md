<<<<<<< Updated upstream
# HRMS — Human Resource Management System

A full-stack HRMS platform with AI-powered features for HR, Employees, and Candidates.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS, Axios, Socket.IO Client |
| Backend | Node.js, Express, MongoDB (Mongoose), JWT, Socket.IO |
| AI Services | Python, Flask, FastAPI, Google Gemini 2.5 Flash |
| Database | MongoDB Atlas |

---

## Services & Ports

| Service | Port | Description |
|---|---|---|
| React Frontend | 3000 | Main UI |
| Node Backend | 5002 | Core API, auth, HR/admin routes |
| Resume Screening | 5001 | Flask — NLP-based resume screening |
| Interview Analysis | 5004 | Flask — AI interview service |
| Resume AI Chatbot | 5009 | FastAPI — resume upload & candidate chat |
| Chatbot Gateway | 5011 | Node — HR chatbot server |
| HR Bot | 6000 | Flask — Gemini-powered HR assistant & AI proxy |

---

## Project Structure

```
fwc_proj/
├── frontend/          # React app
│   ├── src/
│   │   ├── pages/     # Route-level page components
│   │   ├── components/# Reusable UI components
│   │   └── api/       # Axios service files
├── backend/           # Node.js Express API
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── controllers/
│   │   ├── models/    # Mongoose schemas
│   │   ├── middlewares/
│   │   └── utils/     # Shared helpers (e.g. gemini.js)
├── ai-services/
│   ├── hrbot/         # Gemini HR chatbot (port 6000)
│   ├── resume_screening/  # NLP resume screener (port 5001)
│   ├── interview_analysis/ # Interview AI (port 5004)
│   └── new_ai/        # Resume chatbot (port 5009)
├── logs/              # Per-service log files
└── start_all.sh       # Start all services
```

---

## Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/raghobaa/fwc_repo.git
cd fwc_proj

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Python services
cd ../ai-services && python3 -m venv .venv && source .venv/bin/activate
pip install -r ../requirements.txt
```

### 2. Environment Variables

Create `.env` files (see examples below — never commit real keys):

**`backend/.env`**
```
PORT=5002
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hrms
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your_session_secret
GEMINI_API_KEY=your_gemini_key
HRBOT_URL=http://localhost:6000
```

**`frontend/.env`**
```
REACT_APP_API_URL=http://localhost:5002
REACT_APP_INTERVIEW_API_URL=http://localhost:5004
```

**`ai-services/hrbot/.env`**
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hrms
GEMINI_API_KEY=your_gemini_key
```

### 3. Run

```bash
# Start all services at once
chmod +x start_all.sh && ./start_all.sh

# Or individually
cd backend && npm start
cd frontend && npm start
cd ai-services/hrbot && python app.py
cd ai-services/resume_screening && python resume_screening_flask.py
```

---

## Features

### HR / Admin
- Employee management, attendance, leave approvals
- Payroll generation and release
- Resume screening with NLP scoring
- Job posting and applicant tracking
- Interview scheduling with video rooms (WebRTC)
- AI HR chatbot with live MongoDB data (Gemini)
- Project and task management

### Employee
- Dashboard with attendance, payroll, leave requests
- Skill tracker with learning roadmap (100+ topics)
- AI Work Assistant — task manager, meeting summarizer, work report generator
- AI Idea Hub — submit ideas with Gemini evaluation scores
- Smart Job Finder — internal + market job matching
- AI chatbot scoped to personal data

### Candidate
- Apply for jobs
- AI interview practice (written + real-time)
- Resume builder with ATS analysis
- Skill gap analyzer
- Interview analytics

---

## API Overview

| Prefix | Description |
|---|---|
| `/api/auth` | Login, register, Google OAuth |
| `/api/hr` | HR management routes |
| `/api/employee` | Employee self-service |
| `/api/jobs` | Job listings |
| `/api/resume` | Resume screening proxy |
| `/api/chatbot` | HR & employee chatbot |
| `/api/skill-gap` | AI skill gap analysis |
| `/api/ai-interview` | AI interview questions & evaluation |
| `/api/resume-builder` | Resume generation & ATS check |
| `/api/ideas` | Employee idea hub |
| `/api/work-assistant` | Tasks, planner, AI reports |
| `/api/job-finder` | Internal + market job matching |
| `/api/interviews` | Interview scheduling |
| `/api/profile` | User profile management |

---

## Notes

- All Gemini AI calls in Node.js proxy through the hrbot service on port 6000
- `.env` files are gitignored — never commit API keys or DB credentials
- `__pycache__` and `node_modules` are gitignored
=======
# HRMS — Human Resource Management System

A full-stack HRMS platform with AI-powered features for HR, Employees, and Candidates.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS, Axios, Socket.IO Client |
| Backend | Node.js, Express, MongoDB (Mongoose), JWT, Socket.IO |
| AI Services | Python, Flask, FastAPI, Google Gemini 2.5 Flash |
| Database | MongoDB Atlas |

---

## Services & Ports

| Service | Port | Description |
|---|---|---|
| React Frontend | 3000 | Main UI |
| Node Backend | 5002 | Core API, auth, HR/admin routes |
| Resume Screening | 5001 | Flask — NLP-based resume screening |
| Interview Analysis | 5004 | Flask — AI interview service |
| Resume AI Chatbot | 5009 | FastAPI — resume upload & candidate chat |
| Chatbot Gateway | 5011 | Node — HR chatbot server |
| HR Bot | 6000 | Flask — Gemini-powered HR assistant & AI proxy |

---

## Project Structure

```
fwc_proj/
├── frontend/          # React app
│   ├── src/
│   │   ├── pages/     # Route-level page components
│   │   ├── components/# Reusable UI components
│   │   └── api/       # Axios service files
├── backend/           # Node.js Express API
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── controllers/
│   │   ├── models/    # Mongoose schemas
│   │   ├── middlewares/
│   │   └── utils/     # Shared helpers (e.g. gemini.js)
├── ai-services/
│   ├── hrbot/         # Gemini HR chatbot (port 6000)
│   ├── resume_screening/  # NLP resume screener (port 5001)
│   ├── interview_analysis/ # Interview AI (port 5004)
│   └── new_ai/        # Resume chatbot (port 5009)
├── logs/              # Per-service log files
└── start_all.sh       # Start all services
```

---

## Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/raghobaa/fwc_repo.git
cd fwc_proj

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Python services
cd ../ai-services && python3 -m venv .venv && source .venv/bin/activate
pip install -r ../requirements.txt
```

### 2. Environment Variables

Create `.env` files (see examples below — never commit real keys):

**`backend/.env`**
```
PORT=5002
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hrms
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your_session_secret
GEMINI_API_KEY=your_gemini_key
HRBOT_URL=http://localhost:6000
```

**`frontend/.env`**
```
REACT_APP_API_URL=http://localhost:5002
REACT_APP_INTERVIEW_API_URL=http://localhost:5004
```

**`ai-services/hrbot/.env`**
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hrms
GEMINI_API_KEY=your_gemini_key
```

### 3. Run

```bash
# Start all services at once
chmod +x start_all.sh && ./start_all.sh

# Or individually
cd backend && npm start
cd frontend && npm start
cd ai-services/hrbot && python app.py
cd ai-services/resume_screening && python resume_screening_flask.py
```

---

## Features

### HR / Admin
- Employee management, attendance, leave approvals
- Payroll generation and release
- Resume screening with NLP scoring
- Job posting and applicant tracking
- Interview scheduling with video rooms (WebRTC)
- AI HR chatbot with live MongoDB data (Gemini)
- Project and task management

### Employee
- Dashboard with attendance, payroll, leave requests
- Skill tracker with learning roadmap (100+ topics)
- AI Work Assistant — task manager, meeting summarizer, work report generator
- AI Idea Hub — submit ideas with Gemini evaluation scores
- Smart Job Finder — internal + market job matching
- AI chatbot scoped to personal data

### Candidate
- Apply for jobs
- AI interview practice (written + real-time)
- Resume builder with ATS analysis
- Skill gap analyzer
- Interview analytics

---

## API Overview

| Prefix | Description |
|---|---|
| `/api/auth` | Login, register, Google OAuth |
| `/api/hr` | HR management routes |
| `/api/employee` | Employee self-service |
| `/api/jobs` | Job listings |
| `/api/resume` | Resume screening proxy |
| `/api/chatbot` | HR & employee chatbot |
| `/api/skill-gap` | AI skill gap analysis |
| `/api/ai-interview` | AI interview questions & evaluation |
| `/api/resume-builder` | Resume generation & ATS check |
| `/api/ideas` | Employee idea hub |
| `/api/work-assistant` | Tasks, planner, AI reports |
| `/api/job-finder` | Internal + market job matching |
| `/api/interviews` | Interview scheduling |
| `/api/profile` | User profile management |

---

## Notes

- All Gemini AI calls in Node.js proxy through the hrbot service on port 6000
- `.env` files are gitignored — never commit API keys or DB credentials
- `__pycache__` and `node_modules` are gitignored
>>>>>>> Stashed changes
