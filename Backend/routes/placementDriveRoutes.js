import express from 'express';
import {
    getPlacementDrives,
    getPlacementDriveById,
    getPlacementDriveStats,
    createPlacementDrive,
    updatePlacementDrive,
    deletePlacementDrive,
    registerStudent
} from '../controllers/placementDriveController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getPlacementDrives);
router.get('/stats', getPlacementDriveStats);
router.get('/:id', getPlacementDriveById);
router.post('/', createPlacementDrive);
router.put('/:id', updatePlacementDrive);
router.delete('/:id', deletePlacementDrive);
router.post('/:id/register', registerStudent);

export default router;