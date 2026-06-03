#!/usr/bin/env python3
"""
Database setup script for AI Voice Interview Agent
This script helps you set up MongoDB collections and test the connection
"""

import os
from dotenv import load_dotenv
from tools.mongodb_handler import mongodb_handler

def setup_database():
    """Setup database collections and indexes"""
    print("🗄️  Setting up MongoDB database for AI Voice Interview Agent")
    print("=" * 60)
    
    # Load environment variables
    load_dotenv()
    
    # Check if MongoDB URI is configured
    mongodb_uri = os.getenv('MONGODB_URI')
    if not mongodb_uri or mongodb_uri == 'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/':
        print("❌ Please configure your MongoDB URI in the .env file")
        print("   Update MONGODB_URI with your actual connection string")
        return False
    
    # Test MongoDB connection
    print("🔗 Testing MongoDB connection...")
    if not mongodb_handler.connect():
        print("❌ Failed to connect to MongoDB")
        print("   Please check your MONGODB_URI in the .env file")
        return False
    
    # Create indexes for better performance
    print("📊 Creating database indexes...")
    mongodb_handler.create_indexes()
    
    # Test collections
    print("📁 Testing collections...")
    
    # Test interviews collection
    try:
        test_interview = {
            "candidate_name": "Test Candidate",
            "interview_type": "test",
            "session_id": "test_001",
            "created_at": "2024-01-01T00:00:00Z"
        }
        mongodb_handler.interviews_collection.insert_one(test_interview)
        mongodb_handler.interviews_collection.delete_one({"session_id": "test_001"})
        print("✅ Interviews collection is working")
    except Exception as e:
        print(f"❌ Interviews collection error: {e}")
        return False
    
    # Test candidates collection
    try:
        test_candidate = {
            "name": "Test Candidate",
            "email": "test@example.com",
            "created_at": "2024-01-01T00:00:00Z"
        }
        mongodb_handler.candidates_collection.insert_one(test_candidate)
        mongodb_handler.candidates_collection.delete_one({"email": "test@example.com"})
        print("✅ Candidates collection is working")
    except Exception as e:
        print(f"❌ Candidates collection error: {e}")
        return False
    
    print("\n🎉 Database setup completed successfully!")
    print("   Your AI Voice Interview Agent is ready to use MongoDB")
    
    return True

def show_database_info():
    """Show information about the database"""
    print("\n📊 Database Information:")
    print("=" * 30)
    
    try:
        # Get database stats
        db_stats = mongodb_handler.db.command("dbStats")
        print(f"Database: {db_stats['db']}")
        print(f"Collections: {db_stats['collections']}")
        print(f"Data Size: {db_stats['dataSize']} bytes")
        print(f"Storage Size: {db_stats['storageSize']} bytes")
        
        # Get collection counts
        interviews_count = mongodb_handler.interviews_collection.count_documents({})
        candidates_count = mongodb_handler.candidates_collection.count_documents({})
        
        print(f"\nCollection Counts:")
        print(f"  Interviews: {interviews_count}")
        print(f"  Candidates: {candidates_count}")
        
        # Show recent interviews
        if interviews_count > 0:
            print(f"\nRecent Interviews:")
            recent_interviews = list(mongodb_handler.interviews_collection.find().sort("created_at", -1).limit(3))
            for interview in recent_interviews:
                print(f"  - {interview.get('candidate_name', 'Unknown')} ({interview.get('created_at', 'Unknown date')})")
        
    except Exception as e:
        print(f"❌ Error getting database info: {e}")

def main():
    """Main setup function"""
    print("AI Voice Interview Agent - Database Setup")
    print("=" * 50)
    
    # Setup database
    if setup_database():
        show_database_info()
        
        print("\n✅ Setup complete! You can now:")
        print("   1. Run voice interviews: python voice_interview_agent.py")
        print("   2. View interview history in MongoDB Atlas")
        print("   3. Access data through your existing HRMS system")
    else:
        print("\n❌ Setup failed. Please check your configuration and try again.")

if __name__ == "__main__":
    main()
