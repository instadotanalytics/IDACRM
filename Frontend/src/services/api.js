// services/api.js - UPDATED (sessionStorage-based auth via auth.js helpers)
// Only the request/response interceptors and getCurrentUser helpers changed.
// All API definitions (authAPI, superAdminAPI, revenueAPI, reportsAPI, etc.)
// are exactly as your original file.
import axios from "axios";
import { getToken, getUser, clearAuth } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================
// REQUEST INTERCEPTOR
// =======================
api.interceptors.request.use(
  (config) => {
    // ✅ getToken() reads sessionStorage first (tab-isolated), then falls
    //    back to localStorage only when "Remember me" was set.
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// =======================
// RESPONSE INTERCEPTOR
// =======================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.config?.url);

    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isLoginPage =
        currentPath === "/login" || currentPath === "/super-admin-login";

      if (!isLoginPage) {
        // ✅ Read role BEFORE clearing so we redirect to the right login page
        let role = null;
        try {
          const user = getUser(); // reads from sessionStorage (tab-isolated)
          if (user) role = user.role;
        } catch (err) {
          console.error("User parse error:", err);
        }

        // ✅ clearAuth() wipes both sessionStorage AND localStorage for this tab
        clearAuth();

        if (role === "super_admin") {
          window.location.href = "/super-admin-login";
        } else {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

// =======================
// HELPER FUNCTIONS
// =======================
export const getCurrentUser = () => {
  try {
    // ✅ Uses sessionStorage via auth helper (tab-isolated)
    return getUser();
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

export const getCurrentUserId = () => {
  try {
    const user = getCurrentUser();
    if (!user) return null;
    return user._id || user.id || user.userId || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

export const getCurrentUserRole = () => {
  try {
    const user = getCurrentUser();
    if (!user) return null;
    return user.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

// =======================
// AUTH API
// =======================
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    api.post("/auth/reset-password", { token, newPassword }),
  changePassword: (currentPassword, newPassword) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),
  logout: () => api.post("/auth/logout"),
};

// =======================
// SUPER ADMIN API
// =======================
export const superAdminAPI = {
  login: (credentials) => api.post("/super-admin/login", credentials),
  getProfile: () => api.get("/super-admin/profile"),
  getStats: () => api.get("/super-admin/dashboard"),
  getUsers: (params) => api.get("/super-admin/users", { params }),
  createUser: (userData) => api.post("/super-admin/users", userData),
  updateUser: (id, userData) => api.put(`/super-admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/super-admin/users/${id}`),
  logout: () => api.post("/super-admin/logout"),
};

// =======================
// REVENUE API
// =======================
export const revenueAPI = {
  getDashboardData: () => {
    return api.get("/revenue/dashboard");
  },
  getTransactions: (params) => {
    return api.get("/revenue/transactions", { params });
  },
  createTransaction: (data) => {
    return api.post("/revenue/transactions", data);
  },
  updateTransaction: (id, data) => {
    return api.put(`/revenue/transactions/${id}`, data);
  },
  deleteTransaction: (id) => {
    return api.delete(`/revenue/transactions/${id}`);
  },
  exportData: (params) => {
    return api.get("/revenue/export", {
      params,
      responseType: "blob",
    });
  },
  getSummary: (params) => {
    return api.get("/revenue/summary", { params });
  },
  getPaymentSources: (params) => {
    return api.get("/revenue/payment-sources", { params });
  },
  getMonthlyTrends: (params) => {
    return api.get("/revenue/monthly-trends", { params });
  },
};

// =======================
// REPORTS & ANALYTICS API
// =======================
export const reportsAPI = {
  // Headline KPI cards
  getOverview: () => {
    return api.get("/reports/overview");
  },
  // Income vs expense over N months — params: { months }
  getRevenueTrends: (params) => {
    return api.get("/reports/revenue-trends", { params });
  },
  // Staff headcount by role / department / active-inactive
  getStaffDistribution: () => {
    return api.get("/reports/staff-distribution");
  },
  // Transaction category breakdown — params: { startDate, endDate }
  getCategoryBreakdown: (params) => {
    return api.get("/reports/category-breakdown", { params });
  },
  // Combined CSV export — params: { months }
  exportReport: (params) => {
    return api.get("/reports/export", {
      params,
      responseType: "blob",
    });
  },
  // Academic KPI cards — students, batches, materials, capacity
  getAcademicOverview: () => {
    return api.get("/reports/academic-overview");
  },
  // New student enrollments per month — params: { months }
  getEnrollmentTrends: (params) => {
    return api.get("/reports/enrollment-trends", { params });
  },
  // Student headcount by course
  getCourseDistribution: () => {
    return api.get("/reports/course-distribution");
  },
  // Capacity vs enrolled per batch — params: { status }
  getBatchUtilization: (params) => {
    return api.get("/reports/batch-utilization", { params });
  },
};

// =======================
// GENERIC API METHODS
// =======================
export const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

export default api;
