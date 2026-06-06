from pymongo import MongoClient
from config import MONGO_URI, DB_NAME, COLLECTION_NAMES
import argparse
import certifi

# ---------------------------------------------
# MongoDB Connection
# ---------------------------------------------
try:
    client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)
    db = client[DB_NAME]
    print("MongoDB Connected")
except Exception as e:
    print("MongoDB Connection Failed:", e)
    exit()

# ---------------------------------------------
# Get Data From Collection
# ---------------------------------------------
def get_collection_data(collection_name, limit=5):
    try:
        records = list(
            db[collection_name].find({}, {"_id": 0}).limit(limit)
        )

        if not records:
            return f"No records found in {collection_name}"

        output = f"\n{collection_name.upper()}\n"
        output += "-" * 40 + "\n"

        for item in records:
            output += str(item) + "\n\n"

        return output

    except Exception as e:
        return f"Error reading {collection_name}: {e}"

# ---------------------------------------------
# Chat Logic
# ---------------------------------------------
def generate_response(user_message):

    msg = user_message.lower()

    # Greetings
    if "hi" in msg or "hello" in msg:
        return "Hello! Welcome to HRMS. How can I help you today?"

    # Show all collections
    if "collections" in msg:
        return "Available Collections:\n" + "\n".join(COLLECTION_NAMES)

    # Search collection names
    for collection in COLLECTION_NAMES:
        if collection.lower() in msg:
            return get_collection_data(collection)

    # Employee keywords
    if "employee" in msg:
        if "employees" in COLLECTION_NAMES:
            return get_collection_data("employees")

    # Attendance keywords
    if "attendance" in msg:
        if "attendance" in COLLECTION_NAMES:
            return get_collection_data("attendance")

    # Payroll keywords
    if "payroll" in msg or "salary" in msg:
        if "payroll" in COLLECTION_NAMES:
            return get_collection_data("payroll")

    # Leave keywords
    if "leave" in msg:
        if "leaveRequests" in COLLECTION_NAMES:
            return get_collection_data("leaveRequests")

    # Candidate keywords
    if "candidate" in msg:
        if "candidates" in COLLECTION_NAMES:
            return get_collection_data("candidates")

    # User keywords
    if "user" in msg:
        if "users" in COLLECTION_NAMES:
            return get_collection_data("users")

    return (
        "I can help with HRMS data.\n\n"
        "Try:\n"
        "- show employees\n"
        "- show attendance\n"
        "- show payroll\n"
        "- show users\n"
        "- show candidates\n"
        "- show collections"
    )

# ---------------------------------------------
# Main Function
# ---------------------------------------------
def main():

    parser = argparse.ArgumentParser(
        description="MongoDB HRMS Chatbot"
    )

    parser.add_argument(
        "--message",
        type=str,
        help="Message to process"
    )

    args = parser.parse_args()

    # API Mode
    if args.message:
        print(generate_response(args.message))
        return

    # CLI Mode
    print("\nHRMS MongoDB Chatbot")
    print("Type 'exit' to quit.\n")

    while True:

        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit"]:
            print("Chatbot: Goodbye! ")
            break

        response = generate_response(user_input)

        print(f"\nChatbot: {response}\n")

# ---------------------------------------------
# Start Program
# ---------------------------------------------
if __name__ == "__main__":
    main()