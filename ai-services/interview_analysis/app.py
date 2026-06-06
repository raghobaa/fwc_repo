from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5001"])

@app.route('/')
def home():
    return jsonify({"message": "AI Interview Service is running!"})

@app.route('/api/interview', methods=['GET'])
def interview_status():
    return jsonify({
        "status": "active",
        "message": "AI Interview Service is available",
        "endpoints": [
            "POST /api/interview/generate-questions",
            "POST /api/interview/evaluate-answer",
            "GET /api/interview"
        ]
    })

@app.route('/api/interview/generate-questions', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        language = data.get('language', 'General')
        difficulty = data.get('difficulty', 'Medium')
        
        questions = [
            {"text": f"What is your experience with {language}?", "difficulty": difficulty},
            {"text": f"Explain a challenging problem you solved using {language}.", "difficulty": difficulty},
            {"text": f"What are the best practices in {language} development?", "difficulty": difficulty},
            {"text": f"How do you handle errors in {language}?", "difficulty": difficulty},
            {"text": f"Describe a project where you used {language}.", "difficulty": difficulty}
        ]
        
        return jsonify({"questions": questions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/interview/evaluate-answer', methods=['POST'])
def evaluate_answer():
    try:
        data = request.json
        question = data.get('question', '')
        answer = data.get('answer', '')
        language = data.get('language', 'General')
        
        # Simple evaluation logic
        score = 75
        feedback = f"Good attempt! Your answer shows basic understanding of {language}."
        strengths = ["Communication is clear", "Attempted to answer"]
        weaknesses = ["Could add more examples", "More technical depth needed"]
        
        return jsonify({
            "score": score,
            "feedback": feedback,
            "strengths": strengths,
            "weaknesses": weaknesses
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = 5002
    print(f"🚀 AI Interview Service running on port {port}")
    print(f"📍 URL: http://localhost:{port}")
    print(f"📋 Test: http://localhost:{port}/api/interview")
    app.run(debug=True, host='0.0.0.0', port=port)