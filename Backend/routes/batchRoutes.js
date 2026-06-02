import express from 'express';
import {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
    getTrainerBatches,
    assignTrainer
} from '../controllers/batchController.js';
import { protect, adminManagerOnly, superAdminOnly, trainerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Allow counselor to view batches
const canViewBatches = (req, res, next) => {
    const allowedRoles = ['super_admin', 'admin_manager', 'trainer', 'counselor'];
    if (allowedRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Access denied. You cannot view batches.' 
        });
    }
};

// ✅ Allow trainer and admin to create batches
const canCreateBatch = (req, res, next) => {
    const allowedRoles = ['super_admin', 'admin_manager', 'trainer'];
    if (allowedRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Access denied. Only Admin, Manager, or Trainer can create batches.' 
        });
    }
};

// ✅ GET /api/batches - Counselor can view
router.get('/', protect, canViewBatches, getAllBatches);

// ✅ POST /api/batches - Only Admin/Trainer
router.post('/', protect, canCreateBatch, createBatch);

// ✅ GET /api/batches/trainer/assigned - Trainer only
router.get('/trainer/assigned', protect, trainerOnly, getTrainerBatches);

// ✅ GET /api/batches/:id - Counselor can view
router.get('/:id', protect, canViewBatches, getBatchById);

// ✅ PUT /api/batches/:id - Only Admin/Trainer
router.put('/:id', protect, canCreateBatch, updateBatch);

// ✅ PUT /api/batches/:id/assign-trainer - Only Admin/Trainer
router.put('/:id/assign-trainer', protect, canCreateBatch, assignTrainer);

// ✅ DELETE /api/batches/:id - Super Admin only
router.delete('/:id', protect, superAdminOnly, deleteBatch);

export default router;