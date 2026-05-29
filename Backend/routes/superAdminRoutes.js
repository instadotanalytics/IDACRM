import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import { 
    getDashboardStats, getAllUsers, getUserById, createUser, updateUser, deleteUser, getProfile, logout
} from '../controllers/superAdminController.js';
import { protect, superAdminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        
        if (!user || user.role !== 'super_admin') {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account is inactive' });
        }
        
        user.lastLogin = Date.now();
        await user.save();
        
        const token = generateToken(user._id, user.role);
        
        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department || 'management' }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.use(protect, superAdminOnly);

router.get('/profile', getProfile);
router.post('/logout', logout);
router.get('/dashboard', getDashboardStats);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;