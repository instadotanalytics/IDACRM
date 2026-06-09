import express from 'express';
import {
    createMaterial,
    getMaterials,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
    getMaterialsByBatch
} from '../controllers/courseMaterialController.js';
import { protect, trainerOnly } from '../middleware/authMiddleware.js';
import { uploadMaterial } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// ✅ Trainer only routes (Create, Update, Delete)
router.post('/', trainerOnly, uploadMaterial.single('file'), createMaterial);
router.put('/:id', trainerOnly, uploadMaterial.single('file'), updateMaterial);
router.delete('/:id', trainerOnly, deleteMaterial);

// ✅ Get routes - everyone can view (including counselors)
router.get('/', getMaterials);
router.get('/batch/:batchId', getMaterialsByBatch);
router.get('/:id', getMaterialById);

export default router;