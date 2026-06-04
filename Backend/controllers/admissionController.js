import Admission from '../models/Admission.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { deleteFromCloudinary } from '../middleware/uploadMiddleware.js';

const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password + '@123';
};

export const createAdmission = async (req, res) => {
    try {
        console.log('==========================================');
        console.log('🔵 ADMISSION CREATE STARTED');
        console.log('🟡 MongoDB State:', mongoose.connection.readyState);
        console.log('📦 req.body:', req.body);
        console.log('📁 req.file:', req.file);
        console.log('==========================================');

        if (!req.body) {
            return res.status(400).json({ success: false, message: 'Request body is missing' });
        }

        const name           = req.body.name           || '';
        const email          = req.body.email          || '';
        const phone          = req.body.phone          || '';
        const course         = req.body.course         || '';
        const batchId        = req.body.batchId        || null;
        const address        = req.body.address        || '';
        const parentName     = req.body.parentName     || '';
        const parentPhone    = req.body.parentPhone    || '';
        const qualifications = req.body.qualifications || '';
        const admissionDate  = req.body.admissionDate  || new Date();

        console.log('📋 name:', name);
        console.log('📋 email:', email);
        console.log('📋 phone:', phone);
        console.log('📋 course:', course);

        // Validation
        if (!name) {
            if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        if (!email) {
            if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        if (!phone) {
            if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
            return res.status(400).json({ success: false, message: 'Phone is required' });
        }
        if (!course) {
            if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
            return res.status(400).json({ success: false, message: 'Course is required' });
        }

        console.log('✅ Validation passed');

        // Duplicate check
        console.log('🔍 Checking duplicate...');
        const existingAdmission = await Admission.findOne({ email: email.toLowerCase() });
        if (existingAdmission) {
            console.log('❌ Duplicate found');
            if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
            return res.status(400).json({ success: false, message: 'Admission already exists for this email' });
        }
        console.log('✅ No duplicate');

        // Photo
        const photoUrl      = req.file?.path     || '';
        const photoPublicId = req.file?.filename  || '';
        console.log('📸 photoUrl:', photoUrl);
        console.log('📸 photoPublicId:', photoPublicId);

        // User check
        console.log('🔍 Checking existing user...');
        let existingUser = await User.findOne({ email: email.toLowerCase() });
        let userPassword = '';
        let userCreated  = false;

        if (!existingUser) {
            console.log('👤 Creating new user...');
            userPassword = generatePassword();
            const hashedPassword = await bcrypt.hash(userPassword, 10);
            existingUser = await User.create({
                name,
                email:      email.toLowerCase(),
                password:   hashedPassword,
                role:       'student',
                department: 'student',
                phone,
                isActive:   true
            });
            userCreated = true;
            console.log('✅ User created:', existingUser._id);
        } else {
            console.log('✅ Existing user found:', existingUser._id);
        }

        // Create admission
        console.log('📝 Creating admission...');
        const admissionData = {
            name,
            email:          email.toLowerCase(),
            phone,
            course,
            batchId:        batchId || null,
            address,
            parentName,
            parentPhone,
            qualifications,
            admissionDate,
            photo:          photoUrl,
            photoPublicId,
            status:         'active',
            isUserCreated:  userCreated
        };
        console.log('📝 admissionData:', admissionData);

        const admission = await Admission.create(admissionData);
        console.log('✅ Admission created:', admission._id);
        console.log('✅ enrollmentId:', admission.enrollmentId);

        return res.status(201).json({
            success: true,
            message: userCreated
                ? 'Admission completed. Student credentials generated.'
                : 'Admission completed.',
            data: {
                admission: {
                    id:           admission._id,
                    name:         admission.name,
                    email:        admission.email,
                    enrollmentId: admission.enrollmentId,
                    photo:        admission.photo
                },
                credentials: userCreated
                    ? { email: email.toLowerCase(), password: userPassword }
                    : null
            }
        });

    } catch (error) {
        console.log('==========================================');
        console.error('🔴 ADMISSION ERROR CAUGHT');
        console.error('🔴 typeof error:', typeof error);
        console.error('🔴 error:', error);
        console.error('🔴 error.message:', error?.message);
        console.error('🔴 error.name:', error?.name);
        console.error('🔴 error.code:', error?.code);
        console.error('🔴 error.errors:', JSON.stringify(error?.errors, null, 2));
        console.error('🔴 error.stack:', error?.stack);
        console.log('==========================================');

        if (req.file?.filename) await deleteFromCloudinary(req.file.filename);

        if (error?.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File size must be under 5MB' });
        }

        return res.status(500).json({
            success: false,
            message: error?.message || 'Unknown server error',
            errorName: error?.name  || 'Unknown',
            errorCode: error?.code  || 'Unknown'
        });
    }
};

export const getAllAdmissions = async (req, res) => {
    try {
        const admissions = await Admission.find()
            .populate('batchId', 'name code')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: admissions });
    } catch (error) {
        console.error('🔴 getAllAdmissions error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAdmissionById = async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.id)
            .populate('batchId', 'name code');
        if (!admission) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }
        res.json({ success: true, data: admission });
    } catch (error) {
        console.error('🔴 getAdmissionById error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateAdmission = async (req, res) => {
    try {
        console.log('🔵 UPDATE ADMISSION:', req.params.id);

        if (!req.body) {
            return res.status(400).json({ success: false, message: 'Request body is missing' });
        }

        const admission = await Admission.findById(req.params.id);
        if (!admission) {
            if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        const updateData = { ...req.body };

        if (req.file) {
            if (admission.photoPublicId) await deleteFromCloudinary(admission.photoPublicId);
            updateData.photo         = req.file.path;
            updateData.photoPublicId = req.file.filename;
        }

        const updated = await Admission.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('batchId', 'name code');

        console.log('✅ Updated:', updated._id);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('🔴 updateAdmission error:', error.message);
        if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAdmission = async (req, res) => {
    try {
        console.log('🔵 DELETE ADMISSION:', req.params.id);

        const admission = await Admission.findById(req.params.id);
        if (!admission) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        if (admission.photoPublicId) await deleteFromCloudinary(admission.photoPublicId);

        if (admission.isUserCreated) {
            await User.findOneAndDelete({ email: admission.email });
            console.log('✅ User deleted');
        }

        await admission.deleteOne();
        console.log('✅ Admission deleted');
        res.json({ success: true, message: 'Admission deleted successfully' });
    } catch (error) {
        console.error('🔴 deleteAdmission error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Alias for compatibility
export const getAdmissions = getAllAdmissions;

// Get admissions by counselor (ONLY ONE DECLARATION - KEEP THIS)
// Add this at the end of your admissionController.js file
export const getAdmissionsByCounselor = async (req, res) => {
    try {
        const { counselorId } = req.params;
        
        // Check if counselor is accessing their own admissions
        if (req.user.role === 'counselor' && req.user.id !== counselorId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only view your own admissions.' 
            });
        }
        
        // Find admissions - adjust the query based on your schema
        // If your Admission model has a counselorId field:
        // const admissions = await Admission.find({ counselorId: counselorId })
        
        // If not, return all admissions for now
        const Admission = (await import('../models/Admission.js')).default;
        const admissions = await Admission.find({})
            .populate('batchId', 'name code')
            .sort({ createdAt: -1 });
        
        const stats = {
            total: admissions.length,
            active: admissions.filter(a => a.status === 'active').length,
            completed: admissions.filter(a => a.status === 'completed').length
        };
        
        res.json({ 
            success: true, 
            data: admissions, 
            stats,
            counselorId: counselorId 
        });
    } catch (error) {
        console.error('🔴 getAdmissionsByCounselor error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Get admissions by counselor ID for dashboard
// @route   GET /api/admissions/counselor/:counselorId
export const getAdmissionsByCounselorForDashboard = async (req, res) => {
    try {
        const counselorId = req.params.counselorId || req.user._id;
        
        // Agar Admission model mein counselorId field nahi hai toh saare admissions return karo
        const admissions = await Admission.find({})
            .populate('batchId', 'name code')
            .sort({ createdAt: -1 });
        
        const stats = {
            total: admissions.length,
            active: admissions.filter(a => a.status === 'active').length,
            completed: admissions.filter(a => a.status === 'completed').length
        };
        
        res.json({ success: true, data: admissions, stats });
    } catch (error) {
        console.error('getAdmissionsByCounselorForDashboard error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};