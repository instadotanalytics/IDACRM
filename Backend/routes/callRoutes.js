import express from 'express';
import {
    addCallLog,
    getTodayCalls,
    getWeeklyCalls,
    getAllCalls,
    updateCallLog,
    deleteCallLog,
    getCallsByCounselor,
    getCallsByCounselorForDashboard,
    getCounselorWiseCallStats  // ✅ New admin report
} from '../controllers/callLogController.js';
import { protect, adminManagerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// ✅ Admin report route
router.get('/counselor-stats', adminManagerOnly, getCounselorWiseCallStats);

// ✅ Dashboard route for counselor
router.get('/counselor/:counselorId', getCallsByCounselorForDashboard);

router.post('/', addCallLog);
router.get('/today', getTodayCalls);
router.get('/weekly', getWeeklyCalls);
router.get('/', getAllCalls);
router.put('/:id', updateCallLog);
router.delete('/:id', deleteCallLog);

export default router;