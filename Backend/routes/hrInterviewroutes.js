import express from 'express';
import {
    getInterviews,
    getInterviewById,
    getResultAnalytics,
    createInterview,
    updateInterviewStatus,
    deleteInterview
} from '../controllers/hrInterview.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getInterviews);
router.get('/analytics', getResultAnalytics);
router.get('/:id', getInterviewById);
router.post('/', createInterview);
router.put('/:id/status', updateInterviewStatus);
router.delete('/:id', deleteInterview);

export default router;