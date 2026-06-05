import os
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# ─── MongoDB ───────────────────────────────────────────────────────────────────
MONGO_URI = os.getenv(
    "MONGO_URI",
    
)
client = MongoClient(MONGO_URI)
db = client["hrms"]

# All collections the bot can read
COLLECTIONS = [
    "users",
    "employees",
    "attendances",
    "leaverequests",
    "payrolls",
    "projects",
    "jobapplications",
    "jobs",
    "interviews",
    "feedbacks",
    "departments",
]

# ─── Gemini AI ─────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


def fetch_all_data():
    """Fetch a snapshot of all MongoDB collections for context."""
    snapshot = {}
    for col_name in COLLECTIONS:
        try:
            docs = list(db[col_name].find({}, {"_id": 0}).limit(50))
            # Convert datetime objects to strings for JSON serialisation
            for doc in docs:
                for key, val in doc.items():
                    if isinstance(val, datetime):
                        doc[key] = val.isoformat()
            snapshot[col_name] = docs
        except Exception as e:
            snapshot[col_name] = []
    return snapshot


def build_system_prompt(snapshot: dict) -> str:
    data_summary = json.dumps(snapshot, default=str, indent=2)
    return f"""You are an intelligent HR Assistant Chatbot for a company's HRMS (Human Resource Management System).
You have access to the following live MongoDB data from all HR collections:

{data_summary}

Your responsibilities:
- Answer HR-related questions about employees, attendance, leaves, payroll, projects, job applications, interviews, and feedback.
- Provide clear, concise, structured answers.
- When listing items (employees, records, etc.), format them as numbered lists.
- When giving summaries or counts, be specific with numbers.
- If asked to perform an action (approve leave, update payroll, etc.), clearly state what action should be taken and what data is involved.
- Always be professional, helpful, and accurate.
- If you don't have enough data to answer, say so clearly.

Current date/time: {datetime.now().strftime("%Y-%m-%d %H:%M")}
"""


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "hrbot"})


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    user_message = data.get("message", "").strip()
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        # Fetch live data from MongoDB
        snapshot = fetch_all_data()
        system_prompt = build_system_prompt(snapshot)

        # Call Gemini
        full_prompt = f"{system_prompt}\n\nHR Manager asks: {user_message}"
        response = model.generate_content(full_prompt)
        bot_reply = response.text if response.text else "I couldn't generate a response. Please try again."

        return jsonify({
            "response": bot_reply,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return jsonify({"error": str(e), "response": "Sorry, I encountered an error. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 6000))
    print(f"🤖 HR Bot running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
