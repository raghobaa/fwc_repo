import os
import pymongo
from datetime import datetime
from dotenv import load_dotenv
from typing import Dict, List, Optional
import json

load_dotenv()

class MongoDBHandler:
    def __init__(self):
        self.client = None
        self.db = None
        self.interviews_collection = None
        self.candidates_collection = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB Atlas"""
        try:
            # Get MongoDB URI from environment
            mongodb_uri = os.getenv('MONGODB_URI')
            database_name = os.getenv('MONGODB_DATABASE', 'hrms')
            
            if not mongodb_uri:
                print("❌ MONGODB_URI not found in environment variables")
                return False
            
            # Connect to MongoDB
            self.client = pymongo.MongoClient(mongodb_uri)
            self.db = self.client[database_name]
            
            # Initialize collections
            self.interviews_collection = self.db[os.getenv('MONGODB_COLLECTION_INTERVIEWS', 'interviews')]
            self.candidates_collection = self.db[os.getenv('MONGODB_COLLECTION_CANDIDATES', 'candidates')]
            
            # Test connection
            self.client.admin.command('ping')
            print("✅ Connected to MongoDB Atlas successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            return False
    
    def save_interview_session(self, interview_data: Dict) -> bool:
        """Save interview session data to MongoDB"""
        try:
            if self.interviews_collection is None:
                print("❌ Interviews collection not initialized")
                return False
            
            # Add timestamp
            interview_data['created_at'] = datetime.now()
            interview_data['updated_at'] = datetime.now()
            
            # Insert document
            result = self.interviews_collection.insert_one(interview_data)
            print(f"✅ Interview session saved with ID: {result.inserted_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error saving interview session: {e}")
            return False
    
    def save_candidate_data(self, candidate_data: Dict) -> bool:
        """Save candidate data to MongoDB"""
        try:
            if self.candidates_collection is None:
                print("❌ Candidates collection not initialized")
                return False
            
            # Add timestamp
            candidate_data['created_at'] = datetime.now()
            candidate_data['updated_at'] = datetime.now()
            
            # Check if candidate already exists
            existing_candidate = self.candidates_collection.find_one({
                'email': candidate_data.get('email')
            })
            
            if existing_candidate:
                # Update existing candidate
                candidate_data['updated_at'] = datetime.now()
                result = self.candidates_collection.update_one(
                    {'email': candidate_data.get('email')},
                    {'$set': candidate_data}
                )
                print(f"✅ Candidate data updated: {candidate_data.get('name', 'Unknown')}")
            else:
                # Insert new candidate
                result = self.candidates_collection.insert_one(candidate_data)
                print(f"✅ New candidate saved with ID: {result.inserted_id}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error saving candidate data: {e}")
            return False
    
    def get_interview_history(self, candidate_email: str = None) -> List[Dict]:
        """Get interview history for a candidate or all interviews"""
        try:
            if not self.interviews_collection:
                return []
            
            query = {}
            if candidate_email:
                query['candidate_email'] = candidate_email
            
            interviews = list(self.interviews_collection.find(query).sort('created_at', -1))
            
            # Convert ObjectId to string for JSON serialization
            for interview in interviews:
                interview['_id'] = str(interview['_id'])
                if 'created_at' in interview:
                    interview['created_at'] = interview['created_at'].isoformat()
                if 'updated_at' in interview:
                    interview['updated_at'] = interview['updated_at'].isoformat()
            
            return interviews
            
        except Exception as e:
            print(f"❌ Error getting interview history: {e}")
            return []
    
    def get_candidate_list(self) -> List[Dict]:
        """Get list of all candidates"""
        try:
            if not self.candidates_collection:
                return []
            
            candidates = list(self.candidates_collection.find().sort('created_at', -1))
            
            # Convert ObjectId to string for JSON serialization
            for candidate in candidates:
                candidate['_id'] = str(candidate['_id'])
                if 'created_at' in candidate:
                    candidate['created_at'] = candidate['created_at'].isoformat()
                if 'updated_at' in candidate:
                    candidate['updated_at'] = candidate['updated_at'].isoformat()
            
            return candidates
            
        except Exception as e:
            print(f"❌ Error getting candidate list: {e}")
            return []
    
    def get_interview_statistics(self) -> Dict:
        """Get interview statistics"""
        try:
            if not self.interviews_collection:
                return {}
            
            total_interviews = self.interviews_collection.count_documents({})
            hired_count = self.interviews_collection.count_documents({
                'final_recommendation': 'HIRE'
            })
            no_hire_count = self.interviews_collection.count_documents({
                'final_recommendation': 'NO HIRE'
            })
            maybe_count = self.interviews_collection.count_documents({
                'final_recommendation': 'MAYBE'
            })
            
            return {
                'total_interviews': total_interviews,
                'hired_count': hired_count,
                'no_hire_count': no_hire_count,
                'maybe_count': maybe_count,
                'hire_rate': (hired_count / total_interviews * 100) if total_interviews > 0 else 0
            }
            
        except Exception as e:
            print(f"❌ Error getting interview statistics: {e}")
            return {}
    
    def create_indexes(self):
        """Create useful indexes for better performance"""
        try:
            if not self.interviews_collection or not self.candidates_collection:
                return False
            
            # Create indexes for interviews collection
            self.interviews_collection.create_index("candidate_email")
            self.interviews_collection.create_index("created_at")
            self.interviews_collection.create_index("final_recommendation")
            
            # Create indexes for candidates collection
            self.candidates_collection.create_index("email", unique=True)
            self.candidates_collection.create_index("created_at")
            
            print("✅ Database indexes created successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error creating indexes: {e}")
            return False
    
    def close_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("✅ MongoDB connection closed")

# Global MongoDB handler instance
mongodb_handler = MongoDBHandler()
