// routes/salesDashboardRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  // Dashboard
  getDashboardStats,
  getRecentActivities,
  getTopPerformers,
  getPipelineOverview,
  // Calls
  getCalls,
  createCall,
  updateCall,
  deleteCall,
  getCallStats,
  // Leads
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getLeadFunnel,
  // Pipeline
  getPipeline,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  // Targets
  getTargets,
  createTarget,
  updateTarget,
  getRepPerformance,
  // Reports
  getSalesPerformanceReport,
  getRevenueBySource,
  getMonthlyTrend,
  // Events
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  // Notifications
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  // Profile
  getProfile,
  updateProfile,
  updateNotificationSettings,
} from "../controllers/salesDashboardController.js";

const router = express.Router();

// All routes protected
router.use(protect);

// ─── Dashboard ───────────────────────────────────────────────────────────────
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activities", getRecentActivities);
router.get("/dashboard/top-performers", getTopPerformers);
router.get("/dashboard/pipeline-overview", getPipelineOverview);

// ─── Calls ───────────────────────────────────────────────────────────────────
router.get("/calls/stats", getCallStats);
router.get("/calls", getCalls);
router.post("/calls", createCall);
router.put("/calls/:id", updateCall);
router.delete("/calls/:id", deleteCall);

// ─── Leads ───────────────────────────────────────────────────────────────────
router.get("/leads/funnel", getLeadFunnel);
router.get("/leads", getLeads);
router.post("/leads", createLead);
router.put("/leads/:id", updateLead);
router.delete("/leads/:id", deleteLead);

// ─── Pipeline ────────────────────────────────────────────────────────────────
router.get("/pipeline", getPipeline);
router.post("/pipeline", createOpportunity);
router.put("/pipeline/:id", updateOpportunity);
router.delete("/pipeline/:id", deleteOpportunity);

// ─── Targets ─────────────────────────────────────────────────────────────────
router.get("/targets/rep-performance", getRepPerformance);
router.get("/targets", getTargets);
router.post("/targets", createTarget);
router.put("/targets/:id", updateTarget);

// ─── Reports ─────────────────────────────────────────────────────────────────
router.get("/reports/performance", getSalesPerformanceReport);
router.get("/reports/revenue-by-source", getRevenueBySource);
router.get("/reports/monthly-trend", getMonthlyTrend);

// ─── Events (Calendar) ───────────────────────────────────────────────────────
router.get("/events", getEvents);
router.post("/events", createEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

// ─── Notifications ────────────────────────────────────────────────────────────
router.get("/notifications", getNotifications);
router.put("/notifications/read-all", markAllNotificationsRead);
router.put("/notifications/:id/read", markNotificationRead);

// ─── Profile ─────────────────────────────────────────────────────────────────
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/profile/notifications", updateNotificationSettings);

export default router;
