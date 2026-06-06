# Updated to use Gemini 1.5 Flash instead of OpenAI
from config.gemini_config import model, INTERVIEW_PROMPTS
from tools.parser import extract_text_from_pdf, read_text_from_file
from tools.keyword_matcher import match_keywords
from tools.save_data import save_candidate_data
from dotenv import load_dotenv
import os

load_dotenv()

def screen_candidate_with_gemini():
    """Screen candidate using Gemini 1.5 Flash"""
    try:
        # Extract text from resume and job description
        resume_text = extract_text_from_pdf("assets/CV-English.pdf")
        job_description = read_text_from_file("assets/job_description.txt")
        
        # Create screening prompt
        screening_prompt = f"""
        You are a screening assistant. Evaluate whether the candidate has the skills and experience for the job.
        
        Job Description:
        {job_description}
        
        Candidate's Resume:
        {resume_text}
        
        Please analyze the candidate's qualifications against the job requirements and provide:
        1. A detailed evaluation of their skills and experience
        2. Matching keywords found in their resume
        3. A final decision: HIRE or PASS
        4. Brief reasoning for your decision
        
        After your evaluation, end with "TERMINATE".
        """
        
        # Get response from Gemini
        result = model.generate_content(screening_prompt)
        screening_result = result.text
        
        return screening_result
        
    except Exception as e:
        print(f"Error in screening: {e}")
        return "Error occurred during screening."

def extract_candidate_info():
    """Extract candidate information from resume"""
    try:
        resume_text = extract_text_from_pdf("assets/CV-English.pdf")
        
        # Simple extraction - in production, use more sophisticated NLP
        lines = resume_text.split('\n')
        candidate_name = "Unknown"
        email = "N/A"
        phone = "N/A"
        
        for line in lines[:20]:  # Check first 20 lines
            line = line.strip()
            if '@' in line and '.' in line:
                email = line
            elif any(char.isdigit() for char in line) and len(line) > 7:
                phone = line
            elif len(line) > 2 and len(line.split()) <= 4 and not candidate_name:
                candidate_name = line
        
        return candidate_name, email, phone
        
    except Exception as e:
        print(f"Error extracting candidate info: {e}")
        return "Unknown", "N/A", "N/A"

def generate_interview_questions(screening_result):
    """Generate interview questions using Gemini"""
    try:
        interview_prompt = f"""
        Based on the screening results below, generate 5 specific interview questions focusing on any identified skill gaps:
        
        {screening_result}
        
        Generate questions that will help assess the candidate's abilities in areas where their resume showed potential gaps.
        Make the questions conversational and suitable for a voice interview.
        """
        
        result = model.generate_content(interview_prompt)
        return result.text
        
    except Exception as e:
        print(f"Error generating questions: {e}")
        return "Error generating interview questions."

def main():
    """Main function for text-based screening (original functionality)"""
    print("AI Recruitment Agent - Text-based Screening")
    print("=" * 50)
    
    # Screen the candidate
    print("Screening candidate...")
    screening_result = screen_candidate_with_gemini()
    print("Screening Results:")
    print(screening_result)
    
    # Extract candidate information
    print("\nExtracting candidate information...")
    candidate_name, email, phone = extract_candidate_info()
    print(f"Candidate: {candidate_name}")
    print(f"Email: {email}")
    print(f"Phone: {phone}")
    
    # Generate interview questions
    print("\nGenerating interview questions...")
    interview_questions = generate_interview_questions(screening_result)
    print("Recommended Interview Questions:")
    print(interview_questions)
    
    # Save candidate data
    print("\nSaving candidate data...")
    try:
        # Extract decision from screening result
        decision = "PASS"  # Default
        if "HIRE" in screening_result.upper():
            decision = "HIRE"
        
        save_candidate_data(
            candidate_name=candidate_name,
            email=email,
            phone_number=phone,
            matching_keywords="Gemini Analysis",
            screening_result=decision
        )
        print("Candidate data saved successfully!")
        
    except Exception as e:
        print(f"Error saving data: {e}")

if __name__ == "__main__":
    main()