import speech_recognition as sr
import pyttsx3
import threading
import time
import wave
import pyaudio
from pydub import AudioSegment
import io

class VoiceProcessor:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.tts_engine = pyttsx3.init()
        self.setup_voice()
        
    def setup_voice(self):
        """Configure text-to-speech settings"""
        voices = self.tts_engine.getProperty('voices')
        if voices:
            self.tts_engine.setProperty('voice', voices[0].id)
        self.tts_engine.setProperty('rate', 150)  # Speed of speech
        self.tts_engine.setProperty('volume', 0.8)  # Volume level
        
    def speak(self, text):
        """Convert text to speech"""
        print(f"AI: {text}")
        try:
            # Create a fresh TTS engine for each speech
            engine = pyttsx3.init()
            voices = engine.getProperty('voices')
            if voices:
                engine.setProperty('voice', voices[0].id)
            engine.setProperty('rate', 150)
            engine.setProperty('volume', 0.8)
            
            # Speak the text
            engine.say(text)
            engine.runAndWait()
            
            # Clean up
            engine.stop()
            
        except Exception as e:
            print(f"Error in text-to-speech: {e}")
            # Fallback: just print the text
            print(f"TTS Error - Text: {text}")
        
    def listen(self, timeout=20, phrase_time_limit=30):
        """Listen for speech input and convert to text"""
        try:
            with self.microphone as source:
                print("Listening...")
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                
                # Listen for audio input
                audio = self.recognizer.listen(
                    source, 
                    timeout=timeout, 
                    phrase_time_limit=phrase_time_limit
                )
                
            print("Processing speech...")
            # Use Google's free speech recognition
            text = self.recognizer.recognize_google(audio)
            print(f"Candidate: {text}")
            return text
            
        except sr.WaitTimeoutError:
            print("No speech detected within timeout period.")
            return None
        except sr.UnknownValueError:
            print("Could not understand the audio.")
            return None
        except sr.RequestError as e:
            print(f"Could not request results from speech recognition service; {e}")
            return None
        except Exception as e:
            print(f"Error in speech recognition: {e}")
            return None
    
    def listen_with_retry(self, max_retries=2, timeout=20):
        """Listen with retry mechanism"""
        for attempt in range(max_retries):
            print(f"Attempt {attempt + 1}/{max_retries}")
            result = self.listen(timeout=timeout)
            if result and len(result.strip()) > 2:
                return result
            if attempt < max_retries - 1:
                self.speak("I didn't catch that. Please speak clearly.")
        return None
    
    def test_microphone(self):
        """Test if microphone is working"""
        try:
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                print("Microphone test successful!")
                return True
        except Exception as e:
            print(f"Microphone test failed: {e}")
            return False
    
    def test_speakers(self):
        """Test if speakers are working"""
        try:
            self.speak("Speaker test successful!")
            return True
        except Exception as e:
            print(f"Speaker test failed: {e}")
            return False

# Global voice processor instance
voice_processor = VoiceProcessor()
