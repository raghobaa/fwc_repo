# MongoDB Integration Setup Guide

## 🎯 Overview

This guide will help you integrate the AI Voice Interview Agent with your existing MongoDB Atlas `hrms` database. You'll add two new collections to store interview data and candidate information.

## 📋 Prerequisites

1. **Existing MongoDB Atlas Cluster** ✅ (You have this - "Cluster0")
2. **Existing HRMS Database** ✅ (You have this - "hrms" database)
3. **MongoDB Connection String** (Need to get this)
4. **Google Gemini API Key** (Need to get this)

## 🔑 Step 1: Get Your API Keys

### Google Gemini API Key (FREE)
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### MongoDB Connection String
1. Go to your MongoDB Atlas dashboard
2. Click "Connect" on your Cluster0
3. Choose "Connect your application"
4. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)

## ⚙️ Step 2: Configure Environment Variables

Copy the `.env-example` file to `.env` and update it:

```bash
# Copy the example file
cp .env-example .env
```

Then edit `.env` with your actual values:

```env
# Google Gemini API Key (FREE)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/
MONGODB_DATABASE=hrms
MONGODB_COLLECTION_INTERVIEWS=interviews
MONGODB_COLLECTION_CANDIDATES=candidates

# Interview Configuration
INTERVIEW_DURATION_MINUTES=15
QUESTION_INTERVAL_SECONDS=30

# Voice Settings
SPEECH_RATE=150
VOICE_VOLUME=0.8
VOICE_ID=0

# Application Settings
DEBUG=True
LOG_LEVEL=INFO
```

## 🗄️ Step 3: Setup Database Collections

Run the database setup script:

```bash
python setup_database.py
```

This will:
- ✅ Test your MongoDB connection
- ✅ Create two new collections in your `hrms` database:
  - `interviews` - Stores interview sessions and results
  - `candidates` - Stores candidate information
- ✅ Create indexes for better performance
- ✅ Test the collections

## 📊 New Collections Added to Your HRMS Database

### 1. `interviews` Collection
Stores complete interview session data:

```json
{
  "_id": "ObjectId",
  "candidate_name": "John Doe",
  "interview_type": "voice_interview",
  "duration": "0:15:30",
  "questions_asked": 5,
  "overall_score": 85.5,
  "final_recommendation": "HIRE",
  "detailed_scores": [
    {
      "question": "Tell me about yourself",
      "response": "I have 5 years of experience...",
      "scores": {
        "technical_knowledge": 8,
        "communication_skills": 9,
        "problem_solving": 7,
        "experience_relevance": 9,
        "confidence": 8
      }
    }
  ],
  "evaluation_text": "The candidate demonstrated strong...",
  "questions": ["Question 1", "Question 2", ...],
  "session_id": "voice_20241201_143022",
  "created_at": "2024-12-01T14:30:22Z",
  "updated_at": "2024-12-01T14:30:22Z"
}
```

### 2. `candidates` Collection
Stores candidate information:

```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john.doe@email.com",
  "phone": "+1234567890",
  "last_interview_date": "2024-12-01T14:30:22Z",
  "interview_count": 1,
  "last_recommendation": "HIRE",
  "last_score": 85.5,
  "created_at": "2024-12-01T14:30:22Z",
  "updated_at": "2024-12-01T14:30:22Z"
}
```

## 🚀 Step 4: Install Dependencies

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

## 🎤 Step 5: Test the Voice Interview Agent

```bash
python voice_interview_agent.py
```

## 📈 Step 6: View Your Data in MongoDB Atlas

1. Go to your MongoDB Atlas dashboard
2. Navigate to your `hrms` database
3. You'll now see 10 collections (8 original + 2 new):
   - `attendances`
   - `chatmessages`
   - `feedbacks`
   - `jobapplications`
   - `jobs`
   - `leaverequests`
   - `payrolls`
   - `users`
   - **`interviews`** ← NEW
   - **`candidates`** ← NEW

## 🔍 Step 7: Query Your Interview Data

You can now query interview data using MongoDB queries:

```javascript
// Get all interviews
db.interviews.find()

// Get interviews with HIRE recommendation
db.interviews.find({"final_recommendation": "HIRE"})

// Get candidate with highest score
db.interviews.find().sort({"overall_score": -1}).limit(1)

// Get interview statistics
db.interviews.aggregate([
  {
    $group: {
      _id: "$final_recommendation",
      count: { $sum: 1 },
      avgScore: { $avg: "$overall_score" }
    }
  }
])
```

## 🎯 Integration with Your Existing HRMS

The new collections integrate seamlessly with your existing HRMS:

- **`candidates`** can be linked to your existing `users` collection
- **`interviews`** can be linked to `jobapplications` collection
- Interview results can be used in your existing hiring workflow
- Data is stored in the same database for easy access

## 🛠️ Troubleshooting

### Connection Issues
- Verify your MongoDB URI is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure your database user has read/write permissions

### API Key Issues
- Verify your Gemini API key is correct
- Check if you have remaining quota (free tier is generous)

### Audio Issues
- Run `python setup.py` to test audio devices
- Check microphone permissions
- Ensure speakers are working

## 🎉 Success!

Once setup is complete, you'll have:
- ✅ AI voice interviews integrated with your HRMS database
- ✅ Real-time interview scoring and evaluation
- ✅ Comprehensive candidate data storage
- ✅ Seamless integration with existing collections
- ✅ Free to use (only free APIs and libraries)

**Your AI Voice Interview Agent is now ready to conduct interviews and store data in your MongoDB Atlas database!** 🚀
