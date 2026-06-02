import express from 'express';
import {
    createAdmission,
    getAllAdmissions,
    getAdmissionById,
    updateAdmission,
    deleteAdmission
} from '../controllers/admissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const canAccess = (req, res, next) => {
    const allowed = ['super_admin', 'admin_manager', 'counselor'];
    if (allowed.includes(req.user?.role)) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied' });
    }
};

// Multer wrapper — photo optional hai, error bhi handle hoga
const uploadSingle = (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            console.error('🔴 MULTER ERROR:', err.message);
            // Photo error pe bhi aage badhne do — photo optional hai
            // Sirf file type/size error pe rok
            if (err.message === 'Only JPG, PNG, WEBP images are allowed') {
                return res.status(400).json({ success: false, message: err.message });
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size must be under 5MB' });
            }
            // Baaki errors ignore karo, aage badho
            console.error('🔴 Multer non-critical error, continuing:', err.message);
        }
        console.log('✅ Multer — req.body:', req.body);
        console.log('✅ Multer — req.file:', req.file);
        next();
    });
};

router.get('/',        protect, canAccess, getAllAdmissions);
router.post('/create', protect, canAccess, uploadSingle, createAdmission);
router.get('/:id',     protect, canAccess, getAdmissionById);
router.put('/:id',     protect, canAccess, uploadSingle, updateAdmission);
router.delete('/:id',  protect, canAccess, deleteAdmission);

export default router;