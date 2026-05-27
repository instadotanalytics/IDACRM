import SuperAdmin from '../models/SuperAdmin.js';
import generateToken from '../utils/generateToken.js';

// @desc    Login Super Admin
// @route   POST /api/super-admin/login
export const loginSuperAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const superAdmin = await SuperAdmin.findOne({ email });
        
        if (!superAdmin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Check if account is active
        if (!superAdmin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }
        
        // Check password
        const isMatch = await superAdmin.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Update last login
        superAdmin.lastLogin = Date.now();
        await superAdmin.save();
        
        // Generate token
        const token = generateToken(superAdmin._id, superAdmin.email, superAdmin.role);
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: superAdmin._id,
                name: superAdmin.name,
                email: superAdmin.email,
                role: superAdmin.role,
                profilePicture: superAdmin.profilePicture,
                lastLogin: superAdmin.lastLogin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get Super Admin Profile
// @route   GET /api/super-admin/profile
export const getProfile = async (req, res) => {
    try {
        const superAdmin = await SuperAdmin.findById(req.user.id).select('-password');
        
        if (!superAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Super Admin not found'
            });
        }
        
        res.status(200).json({
            success: true,
            user: superAdmin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get Dashboard Stats
// @route   GET /api/super-admin/stats
export const getDashboardStats = async (req, res) => {
    try {
        // You can replace these with actual database counts
        const stats = {
            totalStudents: 1250,
            totalLeads: 342,
            totalCompanies: 48,
            totalRevenue: 2450000,
            placementRate: 78.5,
            activeTrainers: 25,
            pendingFees: 450000
        };
        
        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Logout
// @route   POST /api/super-admin/logout
export const logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};