import express from 'express';
import {
    addCallLog,
    getTodayCalls,
    getWeeklyCalls,
    getAllCalls,
    updateCallLog,
    deleteCallLog,
    getCallsByCounselorForDashboard  // ✅ Import this
} from '../controllers/callLogController.js';
import { protect, counselorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// ✅ Dashboard route for counselor
router.get('/counselor/:counselorId', counselorOnly, getCallsByCounselorForDashboard);

router.post('/', addCallLog);
router.get('/today', getTodayCalls);
router.get('/weekly', getWeeklyCalls);
router.get('/', getAllCalls);
router.put('/:id', updateCallLog);
router.delete('/:id', deleteCallLog);

export default router;