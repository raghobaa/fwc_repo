import time
import threading
from datetime import datetime, timedelta
from config.gemini_config import model, INTERVIEW_DURATION_MINUTES, QUESTION_INTERVAL_SECONDS, INTERVIEW_PROMPTS
from tools.voice_processor import voice_processor

class InterviewSession:
    def __init__(self, candidate_name, job_description):
        self.candidate_name = candidate_name
        self.job_description = job_description
        self.start_time = None
        self.end_time = None
        self.questions_asked = []
        self.responses = []
        self.scores = []
        self.is_active = False
        self.timer_thread = None
        
    def start_interview(self):
        """Start the interview session"""
        self.start_time = datetime.now()
        self.end_time = self.start_time + timedelta(minutes=INTERVIEW_DURATION_MINUTES)
        self.is_active = True
        
        # Start timer thread
        self.timer_thread = threading.Thread(target=self._interview_timer)
        self.timer_thread.daemon = True
        self.timer_thread.start()
        
        # Welcome message
        welcome_msg = INTERVIEW_PROMPTS["opening"].format(duration=INTERVIEW_DURATION_MINUTES)
        voice_processor.speak(welcome_msg)
        
        # Wait for candidate confirmation
        confirmation = voice_processor.listen_with_retry()
        if confirmation and any(word in confirmation.lower() for word in ["yes", "ready", "start", "begin", "hello", "okay", "ok", "sure", "let's go"]):
            voice_processor.speak("Great! Let's begin the interview.")
            return True
        else:
            voice_processor.speak("Please let me know when you're ready to start.")
            return False
    
    def _interview_timer(self):
        """Background timer for interview duration"""
        while self.is_active and datetime.now() < self.end_time:
            time.sleep(1)
        
        if self.is_active:
            self.end_interview()
    
    def ask_question(self, question):
        """Ask a question and collect response"""
        if not self.is_active:
            return None
            
        self.questions_asked.append(question)
        
        # Speak the question clearly
        print(f"Speaking question: {question}")
        print("About to speak the question...")
        voice_processor.speak(question)
        print("Question spoken!")
        
        # Listen for response
        response = voice_processor.listen_with_retry()
        
        if response:
            self.responses.append({
                "question": question,
                "response": response,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            })
            return response
        else:
            print("No response received, moving to next question")
            return None
    
    def score_response(self, question, response):
        """Score a single response using Gemini"""
        try:
            scoring_prompt = INTERVIEW_PROMPTS["scoring_prompt"].format(
                response=response,
                question=question
            )
            
            result = model.generate_content(scoring_prompt)
            score_text = result.text
            
            # Parse scores from response (basic parsing)
            scores = self._parse_scores(score_text)
            self.scores.append({
                "question": question,
                "response": response,
                "scores": scores,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            })
            
            return scores
            
        except Exception as e:
            print(f"Error scoring response: {e}")
            return None
    
    def _parse_scores(self, score_text):
        """Parse scores from Gemini response"""
        # Simple parsing - in production, you'd want more robust parsing
        scores = {
            "technical_knowledge": 5,
            "communication_skills": 5,
            "problem_solving": 5,
            "experience_relevance": 5,
            "confidence": 5
        }
        
        # Look for numbers in the response
        import re
        numbers = re.findall(r'\b(\d+)\b', score_text)
        if len(numbers) >= 5:
            scores["technical_knowledge"] = min(10, max(0, int(numbers[0])))
            scores["communication_skills"] = min(10, max(0, int(numbers[1])))
            scores["problem_solving"] = min(10, max(0, int(numbers[2])))
            scores["experience_relevance"] = min(10, max(0, int(numbers[3])))
            scores["confidence"] = min(10, max(0, int(numbers[4])))
        
        return scores
    
    def end_interview(self):
        """End the interview session"""
        self.is_active = False
        self.end_time = datetime.now()
        
        voice_processor.speak("Thank you for your time. The interview is now complete. I'll analyze your responses and provide feedback shortly.")
        
        # Generate final evaluation
        final_evaluation = self.generate_final_evaluation()
        return final_evaluation
    
    def generate_final_evaluation(self):
        """Generate final evaluation using Gemini"""
        try:
            # Create interview summary
            interview_summary = self._create_interview_summary()
            
            final_prompt = INTERVIEW_PROMPTS["final_evaluation"].format(
                interview_summary=interview_summary
            )
            
            result = model.generate_content(final_prompt)
            evaluation = result.text
            
            return {
                "candidate_name": self.candidate_name,
                "interview_duration": str(self.end_time - self.start_time),
                "questions_asked": len(self.questions_asked),
                "evaluation": evaluation,
                "detailed_scores": self.scores,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
        except Exception as e:
            print(f"Error generating final evaluation: {e}")
            return None
    
    def _create_interview_summary(self):
        """Create a summary of the interview"""
        summary = f"Interview with {self.candidate_name}\n"
        summary += f"Duration: {self.end_time - self.start_time}\n"
        summary += f"Questions asked: {len(self.questions_asked)}\n\n"
        
        for i, qa in enumerate(self.responses, 1):
            summary += f"Q{i}: {qa['question']}\n"
            summary += f"A{i}: {qa['response']}\n\n"
        
        return summary
    
    def get_remaining_time(self):
        """Get remaining interview time"""
        if not self.is_active:
            return 0
        
        remaining = self.end_time - datetime.now()
        return max(0, remaining.total_seconds())
    
    def is_time_up(self):
        """Check if interview time is up"""
        return not self.is_active or datetime.now() >= self.end_time
