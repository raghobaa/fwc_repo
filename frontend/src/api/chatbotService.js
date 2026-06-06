import axios from 'axios';

let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
if (API_URL.endsWith('/api')) {
  API_URL = API_URL.slice(0, -4);
}

/**
 * Send a message to the chatbot and get a response
 * @param {string} message - The user's message to the chatbot
 * @returns {Promise} - Promise with the chatbot's response
 */
export const sendMessage = async (message) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    
    const { data } = await axios.post(
      `${API_URL}/api/chatbot/message`,
      { message },
      config
    );
    
    return data;
  } catch (error) {
    console.error('Error sending message to chatbot:', error);
    throw error;
  }
};

const chatbotService= {
  sendMessage,
};
export default chatbotService;