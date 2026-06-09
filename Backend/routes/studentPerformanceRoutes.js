import express from 'express';
import {
    getBatchPerformance,
    calculatePerformance
} from '../controllers/studentPerformanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ All routes require authentication (no trainerOnly restriction)
router.use(protect);

// ✅ Get batch performance - everyone can view
router.get('/batch/:batchId', getBatchPerformance);

// ✅ Calculate performance - trainers and admins only
router.post('/calculate/:studentId', calculatePerformance);

export default router;