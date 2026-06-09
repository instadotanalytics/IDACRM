import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// =======================
// REQUEST INTERCEPTOR
// =======================
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

// =======================
// RESPONSE INTERCEPTOR
// =======================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/login' || currentPath === '/super-admin-login';
      
      if (!isLoginPage) {
        let role = null;
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            role = JSON.parse(userData).role;
          }
        } catch (err) {
          console.error('User parse error:', err);
        }
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (role === 'super_admin') {
          window.location.href = '/super-admin-login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// =======================
// HELPER FUNCTIONS - FIXED
// =======================
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    const user = JSON.parse(userData);
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getCurrentUserId = () => {
  try {
    const user = getCurrentUser();
    if (!user) return null;
    // Try all possible ID field names
    return user._id || user.id || user.userId || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const getCurrentUserRole = () => {
  try {
    const user = getCurrentUser();
    if (!user) return null;
    return user.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// =======================
// AUTH API
// =======================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
  logout: () => api.post('/auth/logout')
};

// =======================
// SUPER ADMIN API
// =======================
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

// =======================
// GENERIC API METHODS
// =======================
export const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config)
};

export default api;