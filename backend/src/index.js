import dotenv from "dotenv";
import path from "path";
import fs from 'fs';
import mongoose from 'mongoose';
import app from "./app.js";
import User from "./models/User.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

// ========== MONGODB CONNECTION ==========
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Create uploads directory
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'Running',
    port: PORT,
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test endpoint to check MongoDB
app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ 
      message: 'MongoDB is connected!', 
      userCount: userCount,
      status: 'success'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🍃 MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected ✓' : 'Disconnected ✗'}\n`);
});