import express from 'express';
import {
    saveBulkAttendance,
    getAttendance,
    getAttendanceByTrainer,
    getMonthlyReport,
    updateAttendance,
    deleteAttendance
} from '../controllers/attendanceController.js';
import { protect, trainerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(trainerOnly);

// ✅ Routes with tracking
router.post('/bulk', saveBulkAttendance);
router.get('/', getAttendance);
router.get('/trainer/stats', getAttendanceByTrainer);
router.get('/batch/monthly', getMonthlyReport);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

export default router;