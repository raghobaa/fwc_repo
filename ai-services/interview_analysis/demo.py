#!/usr/bin/env python3
"""
Demo script for AI Voice Interview Agent
This script demonstrates both voice and text modes
"""

import os
import sys
from dotenv import load_dotenv

def check_requirements():
    """Check if all requirements are met"""
    print("Checking requirements...")
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("❌ .env file not found. Please run setup.py first.")
        return False
    
    # Check if API key is set
    load_dotenv()
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or api_key == 'your_gemini_api_key_here':
        print("❌ Gemini API key not set. Please add your API key to .env file.")
        return False
    
    # Check if required files exist
    required_files = [
        'assets/CV-English.pdf',
        'assets/job_description.txt'
    ]
    
    for file in required_files:
        if not os.path.exists(file):
            print(f"❌ Required file not found: {file}")
            return False
    
    print("✅ All requirements met!")
    return True

def demo_text_mode():
    """Demo text-based screening"""
    print("\n" + "="*50)
    print("DEMO: Text-based Screening Mode")
    print("="*50)
    
    try:
        from app import main as text_main
        text_main()
    except Exception as e:
        print(f"Error in text mode: {e}")

def demo_voice_mode():
    """Demo voice interview mode"""
    print("\n" + "="*50)
    print("DEMO: Voice Interview Mode")
    print("="*50)
    
    try:
        from voice_interview_agent import main as voice_main
        voice_main()
    except Exception as e:
        print(f"Error in voice mode: {e}")

def main():
    """Main demo function"""
    print("AI Voice Interview Agent - Demo")
    print("=" * 40)
    
    # Check requirements
    if not check_requirements():
        print("\nPlease fix the issues above and try again.")
        return
    
    # Ask user which mode to demo
    print("\nChoose demo mode:")
    print("1. Text-based Screening (Original functionality)")
    print("2. Voice Interview (New functionality)")
    print("3. Both modes")
    
    try:
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == "1":
            demo_text_mode()
        elif choice == "2":
            demo_voice_mode()
        elif choice == "3":
            demo_text_mode()
            demo_voice_mode()
        else:
            print("Invalid choice. Please run the demo again.")
            
    except KeyboardInterrupt:
        print("\nDemo interrupted by user.")
    except Exception as e:
        print(f"Demo error: {e}")

if __name__ == "__main__":
    main()
