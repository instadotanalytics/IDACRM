import express from 'express';
import {
    saveBulkAttendance,
    getAttendance,
    getAttendanceByTrainer,
    getMonthlyReport,
    updateAttendance,
    deleteAttendance
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ All routes require authentication (no trainerOnly restriction)
router.use(protect);

// ✅ Routes - Now accessible by both trainers and counselors
router.post('/bulk', saveBulkAttendance);
router.get('/', getAttendance);
router.get('/trainer/stats', getAttendanceByTrainer);
router.get('/batch/monthly', getMonthlyReport);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

export default router;