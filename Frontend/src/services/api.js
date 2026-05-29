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

// Handle auth errors - FIXED - No automatic redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    
    // Only clear storage and redirect on 401, but let ProtectedRoute handle it
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/super-admin-login' || currentPath === '/login';
      
      if (!isLoginPage) {
        console.log('401 Unauthorized, clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect here - let ProtectedRoute handle it
        window.dispatchEvent(new Event('authError'));
      }
    }
    
    return Promise.reject(error);
  }
);

// Super Admin API
export const superAdminAPI = {
  login: (credentials) => api.post('/super-admin/login', credentials),
  getProfile: () => api.get('/super-admin/profile'),
  getStats: () => api.get('/super-admin/dashboard'),
  getUsers: (params) => api.get('/super-admin/users', { params }),
  createUser: (userData) => api.post('/super-admin/users', userData),
  updateUser: (id, userData) => api.put(`/super-admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/super-admin/users/${id}`),
  logout: () => api.post('/super-admin/logout')
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
  logout: () => api.post('/auth/logout')
};

export default api;