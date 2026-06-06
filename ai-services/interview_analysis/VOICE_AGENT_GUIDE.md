# AI Voice Interview Agent - Complete Guide

## 🎯 What You've Built

You now have a **complete AI voice interview agent** that:
- ✅ Uses **100% free and open-source resources**
- ✅ Replaced OpenAI GPT-4o-mini with **Google Gemini 1.5 Flash** (completely free)
- ✅ Conducts **real-time voice interviews** with speech recognition and text-to-speech
- ✅ Provides **automated scoring** and evaluation
- ✅ Manages **fixed-duration interviews** with timers
- ✅ Saves results to **CSV database**

## 🚀 Quick Start

### 1. Setup (One-time)
```bash
python setup.py
```

### 2. Get Free Gemini API Key
- Visit: https://aistudio.google.com/app/apikey
- Create free account
- Generate API key
- Add to `.env` file: `GEMINI_API_KEY=your_key_here`

### 3. Run Voice Interview
```bash
python voice_interview_agent.py
```

## 📁 New Files Created

### Core Voice Agent
- `voice_interview_agent.py` - Main voice interview application
- `config/gemini_config.py` - Gemini API configuration
- `tools/voice_processor.py` - Voice input/output handling
- `tools/interview_session.py` - Interview session management

### Setup & Demo
- `setup.py` - Automated setup script
- `demo.py` - Demo both text and voice modes
- `requirements.txt` - All free dependencies

## 🔧 Key Features

### Voice Interview Mode
- **Real-time conversation** with speech recognition
- **15-minute fixed duration** interviews
- **Live scoring** on 5 criteria (Technical, Communication, Problem-solving, Experience, Confidence)
- **Automatic question generation** based on job description
- **Comprehensive evaluation** with final scores

### Text Screening Mode (Original)
- Resume screening against job descriptions
- Candidate information extraction
- Interview question generation
- CSV data management

## 💰 Cost Analysis

| Resource | Cost | Usage |
|----------|------|-------|
| Google Gemini 1.5 Flash | **FREE** | Generous free tier |
| Google Speech Recognition | **FREE** | Unlimited usage |
| pyttsx3 (TTS) | **FREE** | Local processing |
| spaCy NLP | **FREE** | Open source |
| All other libraries | **FREE** | Open source |

**Total Cost: $0.00** 🎉

## 🎤 Voice Interview Workflow

1. **Setup**: Tests microphone and speakers
2. **Welcome**: Introduces AI interviewer
3. **Questions**: Asks 5 generated questions
4. **Scoring**: Evaluates each response in real-time
5. **Evaluation**: Provides comprehensive feedback
6. **Storage**: Saves results to CSV database

## 📊 Scoring System

Each response is scored on:
- **Technical Knowledge** (30%): Understanding of technologies
- **Communication Skills** (25%): Clarity and articulation  
- **Problem Solving** (20%): Analytical thinking
- **Experience Relevance** (15%): Applicable experience
- **Confidence** (10%): Professional demeanor

## 🔄 Migration from OpenAI

### What Changed
- ✅ Replaced `gpt-4o-mini` with `gemini-1.5-flash`
- ✅ Removed AutoGen dependency (was complex for this use case)
- ✅ Added voice processing capabilities
- ✅ Implemented real-time scoring
- ✅ Added interview session management

### What Stayed the Same
- ✅ Resume parsing (pdfplumber, docx2txt)
- ✅ Data management (CSV saving)
- ✅ Text processing (spaCy)
- ✅ Environment configuration (.env)

## 🛠️ Technical Architecture

```
Voice Interview Agent
├── Voice Input (SpeechRecognition)
├── AI Processing (Gemini 1.5 Flash)
├── Voice Output (pyttsx3)
├── Session Management (Timer, Scoring)
└── Data Storage (CSV)
```

## 🎯 Usage Examples

### Run Voice Interview
```bash
python voice_interview_agent.py
```

### Run Text Screening
```bash
python app.py
```

### Run Demo (Both Modes)
```bash
python demo.py
```

### Setup Everything
```bash
python setup.py
```

## 🔧 Customization

### Interview Duration
Edit `config/gemini_config.py`:
```python
INTERVIEW_DURATION_MINUTES = 15  # Change to desired duration
```

### Scoring Criteria
Modify weights in `config/gemini_config.py`:
```python
SCORING_CRITERIA = {
    "technical_knowledge": 30,    # Adjust percentages
    "communication_skills": 25,
    "problem_solving": 20,
    "experience_relevance": 15,
    "confidence": 10
}
```

### Voice Settings
Customize in `config/gemini_config.py`:
```python
VOICE_SETTINGS = {
    "speech_rate": 150,      # Words per minute
    "voice_volume": 0.8,     # Volume level
    "voice_id": 0           # Voice selection
}
```

## 🚨 Troubleshooting

### Audio Issues
- Run `python setup.py` to test audio devices
- Check microphone permissions
- Ensure speakers are working

### API Issues
- Verify Gemini API key in `.env` file
- Check internet connection
- Ensure API key has proper permissions

### File Issues
- Ensure `assets/CV-English.pdf` exists
- Ensure `assets/job_description.txt` exists
- Check file permissions

## 🎉 Success!

You now have a **professional-grade AI voice interview agent** that:
- Costs **$0** to run
- Uses **cutting-edge AI** (Gemini 1.5 Flash)
- Provides **real-time voice interaction**
- Delivers **comprehensive candidate evaluation**
- Scales **infinitely** with free resources

**Ready to conduct AI-powered interviews!** 🚀
