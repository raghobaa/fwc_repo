# HRMS Resume Chatbot

HR chatbot that lets you upload bulk resumes and search them using natural language powered by **Gemini AI** + **MongoDB Atlas Vector Search**.

---

## Tech Stack
- **Frontend**: React (Vite)
- **Backend**: FastAPI (Python) on port **5009**
- **Database**: MongoDB Atlas
- **AI**: Gemini 1.5 Flash (chat) + text-embedding-004 (embeddings)
- **File Handling**: shutil + os.walk

---

## Project Structure
```
hrms-chatbot/
├── backend/
│   ├── main.py                  # FastAPI app (port 5009)
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── upload.py            # POST /api/upload
│   │   └── chat.py              # POST /api/chat
│   ├── services/
│   │   ├── extractor.py         # PDF/DOCX text extraction
│   │   ├── embedder.py          # Gemini embeddings
│   │   └── vector_search.py     # MongoDB vector search
│   └── db/
│       └── mongo.py             # MongoDB connection
└── frontend/
    └── src/
        ├── App.jsx
        └── components/
            ├── ResumeUploader.jsx
            └── HRChatbot.jsx
```

---

## Setup

### 1. Get a Gemini API Key (Free)
- Go to https://aistudio.google.com/app/apikey
- Create a free API key

### 2. MongoDB Atlas Vector Search Index
After connecting your Atlas cluster, create a vector search index:

1. Go to Atlas → Your Cluster → Search → Create Search Index
2. Choose **JSON Editor** and use this config:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 3072,
      "similarity": "cosine"
    }
  ]
}
```
3. Name it: `resume_vector_index`
4. Collection: `fwc_hrms.embeddings`

> ⚠️ numDimensions is 3072 for Gemini `gemini-embedding-001`

### 3. Backend Setup
```bash
cd backend

# Copy env file
cp .env.example .env
# Edit .env with your GEMINI_API_KEY and MONGO_URI

# Install dependencies
pip install -r requirements.txt

# Run server on port 5009
python main.py
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload folder of resumes |
| GET | `/api/resumes` | List all uploaded resumes |
| DELETE | `/api/resumes/{filename}` | Delete a resume |
| POST | `/api/chat` | Chat with HR assistant |
| GET | `/health` | Health check |

---

## How Upload Works
1. HR selects a folder in React → all PDF/DOCX files sent to FastAPI
2. `shutil.copyfileobj` saves files to `temp_resumes/` folder
3. `pdfplumber` / `python-docx` extracts text
4. Gemini `text-embedding-004` generates 768-dim embedding vector
5. Resume + embedding stored in MongoDB Atlas
6. Temp file deleted after processing

## How Chat Works
1. HR types a question in natural language
2. Question is embedded using Gemini
3. MongoDB Atlas Vector Search finds top 5 matching resumes
4. Matches sent as context to Gemini 1.5 Flash
5. Gemini returns a summary of best matching candidates
