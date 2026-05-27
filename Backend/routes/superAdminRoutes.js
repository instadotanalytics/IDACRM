import express from 'express';
import { 
    loginSuperAdmin, 
    getProfile, 
    getDashboardStats,
    logout 
} from '../controllers/superAdminController.js';
import { protect, superAdminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginSuperAdmin);

// Protected routes (require authentication)
router.get('/profile', protect, superAdminOnly, getProfile);
router.get('/stats', protect, superAdminOnly, getDashboardStats);
router.post('/logout', protect, logout);

export default router;