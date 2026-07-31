// salesApi.js — UPDATED WITH SOCKET INTEGRATION
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get("/sales/dashboard/stats");
export const getRecentActivities = () => api.get("/sales/dashboard/activities");
export const getTopPerformers = () =>
  api.get("/sales/dashboard/top-performers");
export const getPipelineOverview = () =>
  api.get("/sales/dashboard/pipeline-overview");

// ─── Calls ───────────────────────────────────────────────────────────────────
export const getCalls = (params) => api.get("/sales/calls", { params });
export const createCall = (data) => api.post("/sales/calls", data);
export const updateCall = (id, data) => api.put(`/sales/calls/${id}`, data);
export const deleteCall = (id) => api.delete(`/sales/calls/${id}`);
export const getCallStats = () => api.get("/sales/calls/stats");

// ─── Leads ───────────────────────────────────────────────────────────────────
export const getLeads = (params) => api.get("/sales/leads", { params });
export const createLead = (data) => api.post("/sales/leads", data);
export const updateLead = (id, data) => api.put(`/sales/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/sales/leads/${id}`);
export const getLeadFunnel = () => api.get("/sales/leads/funnel");

// ─── Pipeline ────────────────────────────────────────────────────────────────
export const getPipeline = () => api.get("/sales/pipeline");
export const createOpportunity = (data) => api.post("/sales/pipeline", data);
export const updateOpportunity = (id, data) =>
  api.put(`/sales/pipeline/${id}`, data);
export const deleteOpportunity = (id) => api.delete(`/sales/pipeline/${id}`);

// ─── Targets ─────────────────────────────────────────────────────────────────
export const getTargets = () => api.get("/sales/targets");
export const createTarget = (data) => api.post("/sales/targets", data);
export const updateTarget = (id, data) => api.put(`/sales/targets/${id}`, data);
export const getRepPerformance = () =>
  api.get("/sales/targets/rep-performance");

// ─── Reports ─────────────────────────────────────────────────────────────────
export const getReports = (params) => api.get("/sales/reports", { params });
export const getSalesPerformanceReport = () =>
  api.get("/sales/reports/performance");
export const getRevenueBySource = () =>
  api.get("/sales/reports/revenue-by-source");
export const getMonthlyTrend = () => api.get("/sales/reports/monthly-trend");

// ─── Calendar / Events ───────────────────────────────────────────────────────
export const getEvents = (params) => api.get("/sales/events", { params });
export const createEvent = (data) => api.post("/sales/events", data);
export const updateEvent = (id, data) => api.put(`/sales/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/sales/events/${id}`);

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = () => api.get("/sales/notifications");
export const markNotificationRead = (id) =>
  api.put(`/sales/notifications/${id}/read`);
export const markAllNotificationsRead = () =>
  api.put("/sales/notifications/read-all");

// ─── Profile / Settings ───────────────────────────────────────────────────────
export const getProfile = () => api.get("/sales/profile");
export const updateProfile = (data) => api.put("/sales/profile", data);
export const updateNotificationSettings = (data) =>
  api.put("/sales/profile/notifications", data);

export default api;
