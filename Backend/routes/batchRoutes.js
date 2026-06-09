import express from 'express';
import {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
    assignTrainer,
    getTrainerAssignedBatches
} from '../controllers/batchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// ✅ Trainer routes - MUST be BEFORE /:id route
router.get('/trainer/assigned', getTrainerAssignedBatches);

// General routes
router.get('/', getAllBatches);
router.get('/:id', getBatchById);
router.post('/', createBatch);
router.put('/:id', updateBatch);
router.delete('/:id', deleteBatch);
router.put('/:id/assign-trainer', assignTrainer);

export default router;