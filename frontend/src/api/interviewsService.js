import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api/interviews`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const interviewsService = {
  list: async () => {
    const res = await api.get('/');
    return res.data;
  },
  create: async (payload) => {
    const res = await api.post('/', payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await api.put(`/${id}`, payload);
    return res.data;
  },
  cancel: async (id) => {
    const res = await api.delete(`/${id}`);
    return res.data;
  },
  feedback: async (payload) => {
    const res = await api.post('/feedback', payload);
    return res.data;
  },
  getByRoom: async (roomId) => {
    const res = await api.get(`/room/${roomId}`);
    return res.data;
  },
};

export default interviewsService;
