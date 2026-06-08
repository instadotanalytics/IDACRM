import express from 'express';
import {
    getAllAdmissions,
    getAdmissionById,
    createAdmission,
    updateAdmission,
    deleteAdmission,
    getAdmissionsByCounselorForDashboard,
    getCounselorWiseAdmissionStats  // ✅ New admin report
} from '../controllers/admissionController.js';
import { protect, adminManagerOnly } from '../middleware/authMiddleware.js';
import { uploadPhoto } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// ✅ Admin report route
router.get('/counselor-stats', adminManagerOnly, getCounselorWiseAdmissionStats);

// ✅ Dashboard route for counselor
router.get('/counselor/:counselorId', getAdmissionsByCounselorForDashboard);

router.get('/', getAllAdmissions);
router.get('/:id', getAdmissionById);
router.post('/', uploadPhoto, createAdmission);
router.put('/:id', uploadPhoto, updateAdmission);
router.delete('/:id', deleteAdmission);

export default router;