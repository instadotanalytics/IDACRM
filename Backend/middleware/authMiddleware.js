import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';

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
        req.user = await SuperAdmin.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        next();
    } catch (error) {
        res.status(401).json({
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