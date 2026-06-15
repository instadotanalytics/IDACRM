import express from 'express';
import {
    generateReport,
    getDailyReports,
    getDailyReportById,
    updateDailyReport,
    deleteDailyReport,
    getEmployees,
    sendReportToManager,
    markReportAsViewed,
    getReportDashboardStats
} from '../controllers/hrReportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Dashboard Stats (MUST be before /:id)
router.get('/dashboard-stats', getReportDashboardStats);

// Employees List
router.get('/employees', getEmployees);

// Reports Routes
router.get('/', getDailyReports);
router.get('/:id', getDailyReportById);

// Create Report
router.post('/', generateReport);

// Update Report
router.put('/:id', updateDailyReport);

// Send to Manager
router.post('/:id/send-to-manager', sendReportToManager);

// Mark as Viewed
router.put('/:id/mark-viewed', markReportAsViewed);

// Delete Report
router.delete('/:id', deleteDailyReport);

export default router;