import express from 'express';
import {
    getAllAdmissions,
    getAdmissionById,
    createAdmission,
    updateAdmission,
    deleteAdmission,
    getAdmissionsByCounselorForDashboard  // ✅ Import this
} from '../controllers/admissionController.js';
import { protect, counselorOnly } from '../middleware/authMiddleware.js';
import { uploadPhoto } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// ✅ Dashboard route for counselor
router.get('/counselor/:counselorId', counselorOnly, getAdmissionsByCounselorForDashboard);

// GET routes - sabko permission
router.get('/', getAllAdmissions);
router.get('/:id', getAdmissionById);

// POST route - sabko permission
router.post('/', uploadPhoto, createAdmission);
router.put('/:id', uploadPhoto, updateAdmission);
router.delete('/:id', deleteAdmission);

export default router;