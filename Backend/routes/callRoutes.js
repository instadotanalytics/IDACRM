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
    getCounselorWiseCallStats
} from '../controllers/callLogController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// ✅ Admin report route
router.get('/counselor-stats', getCounselorWiseCallStats);

// ✅ Dashboard route for counselor
router.get('/counselor/:counselorId', getCallsByCounselorForDashboard);

// ✅ Main routes
router.post('/', addCallLog);
router.get('/today', getTodayCalls);
router.get('/weekly', getWeeklyCalls);
router.get('/', getAllCalls);
router.put('/:id', updateCallLog);
router.delete('/:id', deleteCallLog);

export default router;