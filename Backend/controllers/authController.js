import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { validationResult } from 'express-validator';

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            return res.status(401).json({
                success: false,
                message: `Account locked. Try again after ${user.lockUntil}`
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        
        if (!isPasswordMatch) {
            user.loginAttempts += 1;
            
            // Lock account after 5 failed attempts
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
            }
            
            await user.save();
            
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                remainingAttempts: 5 - user.loginAttempts
            });
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create super admin (First time setup)
// @route   POST /api/auth/setup
// @access  Public
export const setupSuperAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if super admin already exists
        const existingAdmin = await User.findOne({ role: 'super_admin' });
        
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Super admin already exists'
            });
        }
        
        const superAdmin = await User.create({
            name,
            email,
            password,
            role: 'super_admin',
            department: 'management',
            isActive: true
        });
        
        res.status(201).json({
            success: true,
            message: 'Super admin created successfully',
            user: {
                id: superAdmin._id,
                name: superAdmin.name,
                email: superAdmin.email,
                role: superAdmin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};