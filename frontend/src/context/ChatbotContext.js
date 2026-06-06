import React, { createContext, useContext } from 'react';
import { AuthContext } from './AuthContext';
import Chatbot from '../components/Chatbot';

export const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // Get user role for the chatbot
  const userRole = user?.role?.toLowerCase() || 'employee';

  return (
    <ChatbotContext.Provider value={{ userRole }}>
      {children}
      {/* Render chatbot component globally */}
      {user && <Chatbot userRole={userRole} />}
    </ChatbotContext.Provider>
  );
};

export default ChatbotProvider;