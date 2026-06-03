import os
import time
from datetime import datetime
from config.gemini_config import model, INTERVIEW_PROMPTS
from tools.voice_processor import voice_processor
from tools.interview_session import InterviewSession
from tools.parser import extract_text_from_pdf, read_text_from_file
from tools.save_data import save_candidate_data
from tools.mongodb_handler import mongodb_handler

class VoiceInterviewAgent:
    def __init__(self):
        self.session = None
        self.questions = []
        
    def setup_interview(self, resume_path="assets/CV-English.pdf", job_description_path="assets/job_description.txt"):
        """Setup interview with resume and job description"""
        try:
            # Try to extract candidate information from PDF
            try:
                resume_text = extract_text_from_pdf(resume_path)
                candidate_name = self._extract_candidate_name(resume_text)
            except:
                # If PDF fails, use default candidate name
                candidate_name = "Interview Candidate"
                resume_text = "Candidate resume not available"
            
            # Read job description
            job_description = read_text_from_file(job_description_path)
            
            # Generate interview questions based on job description
            self.questions = self._generate_questions(job_description, resume_text)
            
            # Create interview session
            self.session = InterviewSession(candidate_name, job_description)
            
            return True
            
        except Exception as e:
            print(f"Error setting up interview: {e}")
            return False
    
    def _extract_candidate_name(self, resume_text):
        """Extract candidate name from resume text"""
        # Simple name extraction - in production, use more sophisticated NLP
        lines = resume_text.split('\n')
        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if len(line) > 2 and len(line.split()) <= 4:
                # Likely a name if it's short and in the beginning
                return line
        return "Candidate"
    
    def _generate_questions(self, job_description, resume_text):
        """Generate interview questions using Gemini"""
        try:
            prompt = f"""
            Generate exactly 5 very short interview questions for a software developer role.
            
            Format each question as:
            1. Tell me about yourself
            2. What programming languages do you know
            3. Describe a project you worked on
            4. How do you solve problems
            5. Why do you want this job
            
            Keep each question under 10 words. Make them simple and conversational.
            """
            
            result = model.generate_content(prompt)
            questions_text = result.text
            
            # Parse questions from response
            questions = self._parse_questions(questions_text)
            return questions
            
        except Exception as e:
            print(f"Error generating questions: {e}")
            # Fallback questions - very short
            return [
                "Tell me about yourself",
                "What programming languages do you know",
                "Describe a project you worked on",
                "How do you solve problems",
                "Why do you want this job"
            ]
    
    def _parse_questions(self, questions_text):
        """Parse questions from Gemini response"""
        questions = []
        lines = questions_text.split('\n')
        
        for line in lines:
            line = line.strip()
            # Look for lines that start with numbers
            if line and line[0].isdigit() and '.' in line:
                # Clean up the question
                question = line.split('.', 1)[1].strip()
                # Remove any extra formatting
                question = question.replace('*', '').replace('"', '').replace("'", '')
                if len(question) > 10:  # Make sure it's a real question
                    questions.append(question)
        
        # Ensure we have exactly 5 questions
        while len(questions) < 5:
            questions.append(f"Tell me about your experience in software development.")
        
        return questions[:5]
    
    def conduct_interview(self):
        """Conduct the voice interview"""
        if not self.session:
            print("Interview not set up. Please run setup_interview() first.")
            return None
        
        # Test audio devices
        if not voice_processor.test_microphone():
            print("Microphone test failed. Please check your microphone.")
            return None
        
        if not voice_processor.test_speakers():
            print("Speaker test failed. Please check your speakers.")
            return None
        
        # Start interview
        if not self.session.start_interview():
            print("Interview not started.")
            return None
        
        # Ask questions
        for i, question in enumerate(self.questions):
            if self.session.is_time_up():
                break
                
            print(f"\n--- Question {i+1}/{len(self.questions)} ---")
            print(f"Question: {question}")
            
            # Ask the question (this will speak it)
            response = self.session.ask_question(question)
            
            if response:
                print(f"Response received: {response}")
                # Score the response
                scores = self.session.score_response(question, response)
                if scores:
                    print(f"Scores: {scores}")
            else:
                print(f"No response received for question {i+1}")
            
            # Brief pause between questions
            time.sleep(1)
        
        # End interview and get evaluation
        evaluation = self.session.end_interview()
        
        # Save results
        self._save_interview_results(evaluation)
        
        return evaluation
    
    def _save_interview_results(self, evaluation):
        """Save interview results to both CSV and MongoDB"""
        try:
            if evaluation:
                # Extract data
                candidate_name = evaluation.get("candidate_name", "Unknown")
                overall_score = self._calculate_overall_score(evaluation.get("detailed_scores", []))
                recommendation = self._extract_recommendation(evaluation.get("evaluation", ""))
                
                # Save to CSV (backup)
                save_candidate_data(
                    candidate_name=candidate_name,
                    email="N/A",  # Not extracted in voice interview
                    phone_number="N/A",  # Not extracted in voice interview
                    matching_keywords="Voice Interview",
                    screening_result=recommendation
                )
                
                # Save to MongoDB
                interview_data = {
                    "candidate_name": candidate_name,
                    "interview_type": "voice_interview",
                    "duration": evaluation.get("interview_duration", "Unknown"),
                    "questions_asked": evaluation.get("questions_asked", 0),
                    "overall_score": overall_score,
                    "final_recommendation": recommendation,
                    "detailed_scores": evaluation.get("detailed_scores", []),
                    "evaluation_text": evaluation.get("evaluation", ""),
                    "questions": self.questions,
                    "session_id": f"voice_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                }
                
                # Save interview session to MongoDB
                mongodb_handler.save_interview_session(interview_data)
                
                # Save candidate data to MongoDB
                candidate_data = {
                    "name": candidate_name,
                    "email": "N/A",  # Could be extracted from resume if needed
                    "phone": "N/A",
                    "last_interview_date": datetime.now(),
                    "interview_count": 1,  # Could be incremented if candidate exists
                    "last_recommendation": recommendation,
                    "last_score": overall_score
                }
                
                mongodb_handler.save_candidate_data(candidate_data)
                
                print(f"✅ Interview results saved to both CSV and MongoDB for {candidate_name}")
                
        except Exception as e:
            print(f"❌ Error saving interview results: {e}")
    
    def _calculate_overall_score(self, detailed_scores):
        """Calculate overall score from detailed scores"""
        if not detailed_scores:
            return 0
        
        total_score = 0
        count = 0
        
        for score_data in detailed_scores:
            scores = score_data.get("scores", {})
            if scores:
                question_total = sum(scores.values())
                total_score += question_total
                count += 1
        
        return total_score / count if count > 0 else 0
    
    def _extract_recommendation(self, evaluation_text):
        """Extract recommendation from evaluation text"""
        evaluation_lower = evaluation_text.lower()
        if "hire" in evaluation_lower and "no" not in evaluation_lower:
            return "HIRE"
        elif "no hire" in evaluation_lower or "not hire" in evaluation_lower:
            return "NO HIRE"
        else:
            return "MAYBE"
    
    def print_evaluation(self, evaluation):
        """Print the final evaluation"""
        if not evaluation:
            print("No evaluation available.")
            return
        
        print("\n" + "="*50)
        print("INTERVIEW EVALUATION")
        print("="*50)
        print(f"Candidate: {evaluation.get('candidate_name', 'Unknown')}")
        print(f"Duration: {evaluation.get('interview_duration', 'Unknown')}")
        print(f"Questions Asked: {evaluation.get('questions_asked', 0)}")
        print("\nEvaluation:")
        print(evaluation.get('evaluation', 'No evaluation available'))
        print("="*50)

def main():
    """Main function to run the voice interview agent"""
    print("AI Voice Interview Agent")
    print("=" * 30)
    
    # Initialize agent
    agent = VoiceInterviewAgent()
    
    # Setup interview
    print("Setting up interview...")
    if not agent.setup_interview():
        print("Failed to setup interview. Please check your files.")
        return
    
    print("Interview setup complete!")
    print(f"Generated {len(agent.questions)} questions")
    
    # Show questions that will be asked
    print("\nQuestions that will be asked:")
    for i, question in enumerate(agent.questions, 1):
        print(f"{i}. {question}")
    
    # Conduct interview
    print("\nStarting voice interview...")
    evaluation = agent.conduct_interview()
    
    # Display results
    if evaluation:
        agent.print_evaluation(evaluation)
    else:
        print("Interview failed or was incomplete.")

if __name__ == "__main__":
    main()
