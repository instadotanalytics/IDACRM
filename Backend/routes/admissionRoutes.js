import express from 'express';
import {
    getAllAdmissions,
    getAdmissionById,
    createAdmission,
    updateAdmission,
    deleteAdmission,
    getAdmissionsByCounselorForDashboard
} from '../controllers/admissionController.js';
import { protect, counselorOnly } from '../middleware/authMiddleware.js';
import { uploadPhoto } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// ✅ Counselor routes (must be BEFORE /:id)
router.get('/counselor/:counselorId', counselorOnly, getAdmissionsByCounselorForDashboard);

// General routes
router.get('/', getAllAdmissions);
router.get('/:id', getAdmissionById);
router.post('/', uploadPhoto, createAdmission);
router.put('/:id', uploadPhoto, updateAdmission);
router.delete('/:id', deleteAdmission);

export default router;