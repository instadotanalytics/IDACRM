import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -loginAttempts -lockUntil');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalActiveUsers = await User.countDocuments({ isActive: true });
        const totalInactiveUsers = await User.countDocuments({ isActive: false });
        
        const userRoles = {
            super_admin: await User.countDocuments({ role: 'super_admin' }),
            admin_manager: await User.countDocuments({ role: 'admin_manager' }),
            sales_executive: await User.countDocuments({ role: 'sales_executive' }),
            hr_executive: await User.countDocuments({ role: 'hr_executive' }),
            trainer: await User.countDocuments({ role: 'trainer' }),
            counselor: await User.countDocuments({ role: 'counselor' })
        };
        
        const recentUsers = await User.find().sort('-createdAt').limit(5).select('-password -loginAttempts -lockUntil');
        
        res.status(200).json({
            success: true,
            data: { totalUsers, totalActiveUsers, totalInactiveUsers, userRoles, recentUsers }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (req.query.role && req.query.role !== 'all') query.role = req.query.role;
        if (req.query.status === 'active') query.isActive = true;
        if (req.query.status === 'inactive') query.isActive = false;
        
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        const users = await User.find(query).sort('-createdAt').skip(skip).limit(limit)
            .select('-password -loginAttempts -lockUntil -resetPasswordToken -resetPasswordExpires');
        
        const total = await User.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -loginAttempts -lockUntil');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, department, phone } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and email are required' });
        }
        
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password || 'Password@123', saltRounds);
        
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role || 'sales_executive',
            department: department || 'sales',
            phone: phone || '',
            isActive: true
        });
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { name, email, role, department, phone, isActive, password } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        if (name) user.name = name;
        if (email) user.email = email.toLowerCase();
        if (role) user.role = role;
        if (department) user.department = department;
        if (phone) user.phone = phone;
        if (typeof isActive === 'boolean') user.isActive = isActive;
        
        if (password) {
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            user.password = await bcrypt.hash(password, saltRounds);
        }
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }
        
        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};