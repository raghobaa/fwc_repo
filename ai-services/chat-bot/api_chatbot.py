import os
from flask import Flask, request, jsonify
from flask_cors import CORS

import importlib.util, pathlib
spec = importlib.util.spec_from_file_location("bot", pathlib.Path(__file__).parent / "bot.py")
bot = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bot)
generate_response = bot.generate_response

app = Flask(__name__)
# Allow requests from the frontend (adjust origins as needed)
CORS(app, origins=["*"])

@app.route('/api/chatbot/message', methods=['POST'])
def chat_message():
    """Receive a user message and return the chatbot's reply.
    Expected JSON payload: { "message": "your text" }
    """
    data = request.get_json(force=True, silent=True) or {}
    user_msg = data.get('message', '').strip()
    if not user_msg:
        return jsonify({"error": "Message payload missing"}), 400
    try:
        reply = generate_response(user_msg)
        return jsonify({"reply": reply})
    except Exception as e:
        # Log full traceback for debugging
        import traceback
        tb = traceback.format_exc()
        app.logger.error(f"Chatbot error: {e}\n{tb}")
        return jsonify({"error": f"Chatbot processing failed: {e}"}), 500

@app.route('/api/chatbot/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    # Default to port 5010 unless overridden by env var
    port = int(os.getenv('CHATBOT_PORT', 5010))
    app.run(host='0.0.0.0', port=port, debug=True)
