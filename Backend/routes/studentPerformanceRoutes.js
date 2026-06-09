import express from 'express';
import {
    getBatchPerformance,
    calculatePerformance
} from '../controllers/studentPerformanceController.js';
import { protect, trainerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(trainerOnly);

// Get batch performance
router.get('/batch/:batchId', getBatchPerformance);

// Calculate performance
router.post('/calculate/:studentId', calculatePerformance);

export default router;