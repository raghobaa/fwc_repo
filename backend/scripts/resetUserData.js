import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const resetAllUsersData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    
    // Update all users - reset skill tracker data
    const result = await User.updateMany(
      {},
      {
        $set: {
          skills: [],
          learningRoadmap: [],
          badges: [],
          avgInterviewScore: 0,
          totalLearningHours: 0,
          streakDays: 0
        }
      }
    );
    
    console.log(`Reset ${result.modifiedCount} users' skill tracker data`);
    console.log("All users now have 0 initial values");
    
    process.exit(0);
  } catch (error) {
    console.error("Error resetting data:", error);
    process.exit(1);
  }
};

resetAllUsersData();