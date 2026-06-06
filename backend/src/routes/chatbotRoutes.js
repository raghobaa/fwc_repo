import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Python chatbot script and its directory
const CHATBOT_DIR = path.join(__dirname, "../../../ai-services/chatbot");
const CHATBOT_PATH = path.join(CHATBOT_DIR, "bot.py");

/**
 * @route   GET /api/chatbot/test
 * @desc    Test endpoint for the chatbot (no auth required)
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({ message: "Chatbot API is working" });
});

/**
 * @route   POST /api/chatbot/message
 * @desc    Send a message to the chatbot and get a response
 * @access  Private
 */
router.post("/message", protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Spawn a Python process to run the chatbot script
    // Try 'python3' first, fallback to 'python' if that fails
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    console.log(`Executing: ${pythonCommand} ${CHATBOT_PATH} --message "${message}"`);
    
    const python = spawn(pythonCommand, [
      CHATBOT_PATH,
      "--message", 
      message
    ], { 
      cwd: CHATBOT_DIR,  // Set working directory to chatbot directory
      env: { ...process.env }  // Pass environment variables
    });

    let responseData = "";
    let errorData = "";

    // Collect data from script
    python.stdout.on("data", (data) => {
      responseData += data.toString();
    });

    // Collect error data if any
    python.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    // Handle process completion
    python.on("close", (code) => {
      if (code !== 0) {
        console.error(`Chatbot process exited with code ${code}`);
        console.error(`Error: ${errorData}`);
        return res.status(500).json({ 
          error: "Failed to get response from chatbot",
          details: errorData
        });
      }
      
      return res.json({ response: responseData.trim() });
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;