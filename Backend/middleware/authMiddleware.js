import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive'
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};

export const superAdminOnly = (req, res, next) => {
    if (req.user?.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Super admin access required'
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. ${req.user.role} cannot access this resource`
            });
        }
        next();
    };
};

export const adminManagerOnly = (req, res, next) => {
    if (req.user?.role === 'admin_manager' || req.user?.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Admin manager access required' });
    }
};

export const salesOnly = (req, res, next) => {
    if (req.user?.role === 'sales_executive' || req.user?.role === 'admin_manager' || req.user?.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Sales access required' });
    }
};

export const hrOnly = (req, res, next) => {
    if (req.user?.role === 'hr_executive' || req.user?.role === 'admin_manager' || req.user?.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'HR access required' });
    }
};

export const trainerOnly = (req, res, next) => {
    if (req.user?.role === 'trainer' || req.user?.role === 'admin_manager' || req.user?.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Trainer access required' });
    }
};

export const counselorOnly = (req, res, next) => {
    if (req.user?.role === 'counselor' || req.user?.role === 'admin_manager' || req.user?.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Counselor access required' });
    }
};