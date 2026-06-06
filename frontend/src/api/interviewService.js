import axios from 'axios';

const API_URL =
  process.env.REACT_APP_INTERVIEW_API_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5003';

const interviewApi = axios.create({
  baseURL: `${API_URL}/api/interview`,
  headers: {
    'Content-Type': 'application/json',
  },
});

interviewApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const interviewService = {
  testService: async () => {
    const res = await interviewApi.get('/test');
    return res.data;
  },
  start: async (payload = {}) => {
    const res = await interviewApi.post('/start', payload);
    return res.data;
  },
  next: async (session_id) => {
    const res = await interviewApi.post('/next', { session_id });
    return res.data;
  },
  answer: async (session_id, answer) => {
    const res = await interviewApi.post('/answer', { session_id, answer });
    return res.data;
  },
  finish: async (session_id) => {
    const res = await interviewApi.post('/finish', { session_id });
    return res.data;
  },
};

export default interviewService;
