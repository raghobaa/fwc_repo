#!/usr/bin/env python3
"""
Setup script for AI Voice Interview Agent
"""

import os
import subprocess
import sys

def install_requirements():
    """Install required packages"""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Requirements installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Error installing requirements: {e}")
        return False

def download_spacy_model():
    """Download spaCy English model"""
    print("Downloading spaCy English model...")
    try:
        subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        print("✓ spaCy model downloaded successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Error downloading spaCy model: {e}")
        return False

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_file = ".env"
    if not os.path.exists(env_file):
        print("Creating .env file...")
        with open(env_file, "w") as f:
            f.write("# AI Voice Interview Agent Configuration\n")
            f.write("# Get your free Gemini API key from: https://aistudio.google.com/app/apikey\n")
            f.write("GEMINI_API_KEY=your_gemini_api_key_here\n")
        print("✓ .env file created! Please add your Gemini API key.")
        return False
    else:
        print("✓ .env file already exists.")
        return True

def test_audio_devices():
    """Test audio devices"""
    print("Testing audio devices...")
    try:
        from tools.voice_processor import voice_processor
        
        # Test microphone
        if voice_processor.test_microphone():
            print("✓ Microphone test passed!")
        else:
            print("✗ Microphone test failed!")
            return False
        
        # Test speakers
        if voice_processor.test_speakers():
            print("✓ Speaker test passed!")
        else:
            print("✗ Speaker test failed!")
            return False
        
        return True
        
    except Exception as e:
        print(f"✗ Audio test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("AI Voice Interview Agent Setup")
    print("=" * 40)
    
    # Install requirements
    if not install_requirements():
        return False
    
    # Download spaCy model
    if not download_spacy_model():
        return False
    
    # Create .env file
    env_ready = create_env_file()
    
    # Test audio devices
    print("\nTesting audio devices...")
    audio_ready = test_audio_devices()
    
    print("\n" + "=" * 40)
    print("Setup Summary:")
    print("=" * 40)
    print(f"Requirements: ✓ Installed")
    print(f"spaCy Model: ✓ Downloaded")
    print(f"Environment: {'✓ Ready' if env_ready else '⚠ Needs API key'}")
    print(f"Audio Devices: {'✓ Ready' if audio_ready else '✗ Issues detected'}")
    
    if not env_ready:
        print("\n⚠ IMPORTANT: Please add your Gemini API key to the .env file")
        print("Get your free API key from: https://aistudio.google.com/app/apikey")
    
    if not audio_ready:
        print("\n⚠ IMPORTANT: Please check your microphone and speakers")
    
    if env_ready and audio_ready:
        print("\n🎉 Setup complete! You can now run the voice interview agent.")
        print("Run: python voice_interview_agent.py")
    else:
        print("\n⚠ Setup incomplete. Please address the issues above.")
    
    return env_ready and audio_ready

if __name__ == "__main__":
    main()
