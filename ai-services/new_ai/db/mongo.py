from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os

MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "hrms")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "embeddings")

client = MongoClient(MONGO_URI, server_api=ServerApi("1"))
db = client[DB_NAME]

resumes_collection = db[COLLECTION_NAME]

def create_vector_index():
    """Vector Search indexes must be created in Atlas Search, not with a normal Mongo index."""
    print("Create an Atlas Vector Search index named 'resume_vector_index' on the embedding field.")
