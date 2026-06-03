import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api/hr/onboarding` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const onboardingService = {
  list: async () => {
    const res = await api.get('/');
    return res.data;
  },
  trigger: async (id) => {
    const res = await api.post(`/${id}/trigger`);
    return res.data;
  },
  withdraw: async (id) => {
    const res = await api.post(`/${id}/withdraw`);
    return res.data;
  },
};

export default onboardingService;
