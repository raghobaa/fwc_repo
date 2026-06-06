import os
import dotenv

# Load environment variables
dotenv.load_dotenv('.env')
dotenv.load_dotenv('.env.development')

# Gemini API Key
GOOGLE_AI_KEY = os.getenv('GOOGLE_AI_KEY')

# MongoDB Configuration
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME')

# Collection Names
COLLECTION_NAMES = os.getenv('COLLECTION_NAMES', '').split(',')

# Gemini Settings
text_generation_config = {
    "temperature": 0.7,
    "top_p": 1,
    "top_k": 1,
}

safety_settings = []