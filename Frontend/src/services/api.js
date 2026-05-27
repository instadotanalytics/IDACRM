import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/super-admin-login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/super-admin/login', credentials),
  getProfile: () => api.get('/super-admin/profile'),
  getStats: () => api.get('/super-admin/stats'),
  logout: () => api.post('/super-admin/logout')
};

export default api;