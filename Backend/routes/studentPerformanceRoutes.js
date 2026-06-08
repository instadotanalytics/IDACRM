import express from 'express';
import {
    calculatePerformance,
    getStudentPerformance,
    getBatchPerformance,
    updateRemarks,
    getPerformanceSummary
} from '../controllers/studentPerformanceController.js';
import { protect, trainerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Trainer routes
router.post('/calculate/:studentId', trainerOnly, calculatePerformance);
router.put('/:id/remarks', trainerOnly, updateRemarks);
router.get('/summary/:batchId', trainerOnly, getPerformanceSummary);
router.get('/batch/:batchId', trainerOnly, getBatchPerformance);

// Get routes
router.get('/:studentId', getStudentPerformance);

export default router;