import axios from "axios";

const HRBOT_URL = process.env.HRBOT_URL || "http://localhost:6000";

/**
 * Send a prompt to Gemini via the hrbot Python service.
 * @param {string} prompt
 * @returns {Promise<string>} response text
 */
export async function geminiChat(prompt) {
  const res = await axios.post(`${HRBOT_URL}/chat`, { message: prompt }, { timeout: 60000 });
  return res.data.response;
}
