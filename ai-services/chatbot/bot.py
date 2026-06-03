import google.generativeai as genai
from pymongo import MongoClient
from config import GOOGLE_AI_KEY, MONGO_URI, DB_NAME, COLLECTION_NAMES
import argparse
import sys

# ---------------------------------------------
# Gemini Configuration
# ---------------------------------------------
genai.configure(api_key=GOOGLE_AI_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# ---------------------------------------------
# MongoDB Setup
# ---------------------------------------------
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# ---------------------------------------------
# Fetch Knowledge from Multiple MongoDB Collections
# ---------------------------------------------
def get_knowledge_from_mongo():
    knowledge_chunks = []

    for col_name in COLLECTION_NAMES:
        col = db[col_name]
        docs = list(col.find({}, {"_id": 0}))

        if docs:
            knowledge_chunks.append(
                f"--- Collection: {col_name} ---\n" + "\n".join([str(doc) for doc in docs])
            )
        else:
            knowledge_chunks.append(f"--- Collection: {col_name} ---\nNo data found")

    return "\n".join(knowledge_chunks)

# ---------------------------------------------
# Generate Gemini Response with Fallback
# ---------------------------------------------
def generate_response(user_message: str) -> str:
    knowledge = get_knowledge_from_mongo()

    prompt = f"""
You are a friendly and knowledgeable HRMS chatbot.

You have access to the following database collections:
{', '.join(COLLECTION_NAMES)}

Below is the database content you can use:
{knowledge}

Your response rules:
1. If the user's question relates to the database content (e.g., employees, jobs, payroll, attendance, etc.), answer strictly based on it.
2. If the question is a general or creative request (e.g., "write a job description", greetings, templates), use your own knowledge to generate a natural response.
3. If the question is completely irrelevant to HRMS or general topics, politely say you can’t answer it.

User: {user_message}
"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip() if response and response.text else "I'm sorry, I didn’t understand that."
    except Exception as e:
        return f"Error: {e}"

# ---------------------------------------------
# CLI Chat Interface or API Mode
# ---------------------------------------------
def main():
    parser = argparse.ArgumentParser(description='HRMS Chatbot with MongoDB + Gemini')
    parser.add_argument('--message', type=str, help='Message to process (API mode)')
    args = parser.parse_args()

    # API mode (useful for frontend calls)
    if args.message:
        reply = generate_response(args.message)
        print(reply)
        return

    # CLI mode
    print("🤖 HRMS Chatbot (MongoDB + Gemini)")
    print("Type 'exit' to quit.\n")

    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Chatbot: Goodbye! 👋")
            break

        reply = generate_response(user_input)
        print(f"Chatbot: {reply}\n")


if __name__ == "__main__":
    main()
