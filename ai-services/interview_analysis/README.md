
An AI-powered voice interview agent that conducts real-time interviews with candidates using Google's free Gemini 1.5 Flash model. The system provides automated resume screening, voice-based interviews, and comprehensive candidate evaluation with scoring.

## Overview

This application provides two modes of operation:
1. **Voice Interview Mode**: Real-time voice conversations with candidates using speech recognition and text-to-speech
2. **Text Screening Mode**: Traditional resume screening and question generation

## Features

### Voice Interview Agent
- **Real-time Voice Interaction**: Conducts interviews using speech recognition and text-to-speech
- **Automated Question Generation**: Creates relevant questions based on job requirements and candidate resume
- **Live Scoring**: Evaluates responses in real-time across multiple criteria
- **Timer Management**: Fixed-duration interviews with automatic time management
- **Comprehensive Evaluation**: Provides detailed feedback and final scores

### Text-based Screening
- **Automated Resume Screening**: Analyzes resumes (PDF format) against job descriptions
- **Smart Data Extraction**: Extracts candidate information including name, email, and phone number
- **Interview Question Generation**: Creates targeted questions based on identified skill gaps
- **Data Management**: Saves candidate information and screening results to CSV database

## Technical Stack (100% Free & Open Source)

- **Python 3.x** - Main programming language
- **Google Gemini 1.5 Flash** - Free AI model for natural language processing
- **SpeechRecognition** - Free speech-to-text using Google's API
- **pyttsx3** - Free text-to-speech engine
- **spaCy** - Free natural language processing library
- **pdfplumber** - Free PDF text extraction
- **docx2txt** - Free DOCX text extraction
- **pydub** - Free audio processing
- **python-dotenv** - Environment variable management

## Installation

### Quick Setup (Recommended)
```bash
git clone https://github.com/yourusername/ai-voice-interview-agent.git
cd ai-voice-interview-agent
python setup.py
```

### Manual Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-voice-interview-agent.git
cd ai-voice-interview-agent
```

2. Install dependencies:
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

3. Get your free Gemini API key:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a free API key
   - Add it to your `.env` file:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Usage

### Voice Interview Mode (Recommended)
1. Place the candidate's resume in `assets/CV-English.pdf`
2. Add the job description in `assets/job_description.txt`
3. Run the voice interview agent:
```bash
python voice_interview_agent.py
```

The voice agent will:
- Test your microphone and speakers
- Generate interview questions based on the job description
- Conduct a 15-minute voice interview
- Score responses in real-time
- Provide comprehensive evaluation and final score

### Text-based Screening Mode
```bash
python app.py
```

This mode provides:
- Resume screening against job description
- Candidate information extraction
- Interview question generation
- Results saved to CSV database

![image](https://github.com/user-attachments/assets/b5bed411-c34a-4e14-8c26-5e4a4906e50e)

## Project Structure

```
├── voice_interview_agent.py    # Main voice interview application
├── app.py                      # Text-based screening application
├── setup.py                    # Setup and installation script
├── requirements.txt            # Python dependencies
├── config/
│   ├── gemini_config.py       # Gemini API configuration
│   ├── agent_config.py        # Agent configurations
│   ├── function_map.py        # Function mappings
│   └── task_prompts.py        # Interview prompts
├── tools/
│   ├── voice_processor.py     # Voice input/output handling
│   ├── interview_session.py   # Interview session management
│   ├── parser.py              # Document parsing utilities
│   ├── keyword_matcher.py     # Keyword matching logic
│   └── save_data.py           # Data saving utilities
└── assets/
    ├── CV-English.pdf         # Sample resume
    ├── job_description.txt    # Sample job description
    └── candidates_database.csv # Generated candidate database
```

## Scoring System

The voice interview agent evaluates candidates on five criteria:
- **Technical Knowledge** (30%): Understanding of relevant technologies
- **Communication Skills** (25%): Clarity and articulation
- **Problem Solving** (20%): Analytical thinking and approach
- **Experience Relevance** (15%): Applicability of past experience
- **Confidence** (10%): Professional demeanor and self-assurance

## Free Resources Used

- **Google Gemini 1.5 Flash**: Completely free AI model with generous usage limits
- **Google Speech Recognition**: Free speech-to-text API
- **pyttsx3**: Free text-to-speech engine
- **spaCy**: Free NLP library with open-source models
- **All other libraries**: Open-source and free to use

## Acknowledgments

- Built with Google's free Gemini 1.5 Flash model
- Uses open-source libraries for voice processing and NLP
- Designed for cost-effective, scalable recruitment automation
