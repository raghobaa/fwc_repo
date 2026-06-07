import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

/**
 * Send a message to the chatbot and get a response
 * @param {string} message - The user's message to the chatbot
 * @returns {Promise} - Promise with the chatbot's response
 */
export const sendMessage = async (message, userRole = 'employee') => {
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
    
    const isHrmsDataChat = ['hr', 'admin'].includes(String(userRole).toLowerCase());
    const endpoint = isHrmsDataChat ? '/api/chatbot/hrms' : '/api/chatbot/employee';

    const { data } = await axios.post(
      `${BASE_URL}${endpoint}`,
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
