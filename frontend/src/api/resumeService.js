import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with authorization header
const resumeApi = axios.create({
  baseURL: `${API_URL}/api/resume`,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add authorization token to every request
resumeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const resumeService = {
  /**
   * Screen resumes against a job description
   * @param {FormData} formData - Form data containing job description, cutoff score, and resume files
   * @returns {Promise} - Promise with screening results
   */
  screenResumes: async (formData) => {
    try {
      const response = await resumeApi.post('/screen', formData);
      return response.data;
    } catch (error) {
      console.error('Error screening resumes:', error);
      throw error;
    }
  },

  /**
   * Test if the resume screening service is available
   * @returns {Promise} - Promise with service status
   */
  testService: async () => {
    try {
      const response = await resumeApi.get('/test');
      return response.data;
    } catch (error) {
      console.error('Resume screening service unavailable:', error);
      throw error;
    }
  }
};

export default resumeService;