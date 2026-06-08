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

// @desc    Create admission (with counselor tracking)
// @route   POST /api/admissions
export const createAdmission = async (req, res) => {
    try {
        console.log('==========================================');
        console.log('🔵 ADMISSION CREATE STARTED');
        console.log('👤 Counselor ID:', req.user.id);
        console.log('👤 Counselor Name:', req.user.name);
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

        // Duplicate check
        const existingAdmission = await Admission.findOne({ email: email.toLowerCase() });
        if (existingAdmission) {
            if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
            return res.status(400).json({ success: false, message: 'Admission already exists for this email' });
        }

        // Photo
        const photoUrl      = req.file?.path     || '';
        const photoPublicId = req.file?.filename || '';

        // User check
        let existingUser = await User.findOne({ email: email.toLowerCase() });
        let userPassword = '';
        let userCreated  = false;

        if (!existingUser) {
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
        }

        // ✅ Create admission with counselor tracking
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
            isUserCreated:  userCreated,
            counselorId:    req.user.id,        // ✅ Auto track counselor ID
            counselorName:  req.user.name,      // ✅ Auto track counselor name
            leadId:         req.body.leadId || null
        };

        const admission = await Admission.create(admissionData);

        console.log('✅ Admission created with counselorId:', admission.counselorId);
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
                    photo:        admission.photo,
                    counselorId:  admission.counselorId,
                    counselorName: admission.counselorName
                },
                credentials: userCreated
                    ? { email: email.toLowerCase(), password: userPassword }
                    : null
            }
        });

    } catch (error) {
        console.error('🔴 ADMISSION ERROR:', error.message);
        if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Unknown server error'
        });
    }
};

// @desc    Get all admissions (Admin sees all, Counselor sees only their own)
// @route   GET /api/admissions
export const getAllAdmissions = async (req, res) => {
    try {
        let query = {};
        
        // ✅ Role-based filtering
        if (req.user.role === 'counselor') {
            query.counselorId = req.user.id;
        }
        
        const admissions = await Admission.find(query)
            .populate('batchId', 'name code')
            .populate('counselorId', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, data: admissions });
    } catch (error) {
        console.error('🔴 getAllAdmissions error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get admission by ID
// @route   GET /api/admissions/:id
export const getAdmissionById = async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.id)
            .populate('batchId', 'name code')
            .populate('counselorId', 'name email');
        
        if (!admission) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }
        
        // ✅ Counselor can only see their own admissions
        if (req.user.role === 'counselor' && admission.counselorId?._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        
        res.json({ success: true, data: admission });
    } catch (error) {
        console.error('🔴 getAdmissionById error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update admission
// @route   PUT /api/admissions/:id
export const updateAdmission = async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.id);
        if (!admission) {
            if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }
        
        // ✅ Counselor can only update their own admissions
        if (req.user.role === 'counselor' && admission.counselorId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
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
        ).populate('batchId', 'name code').populate('counselorId', 'name email');

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('🔴 updateAdmission error:', error.message);
        if (req.file?.filename) await deleteFromCloudinary(req.file.filename);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete admission
// @route   DELETE /api/admissions/:id
export const deleteAdmission = async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.id);
        if (!admission) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }
        
        // ✅ Counselor can only delete their own admissions
        if (req.user.role === 'counselor' && admission.counselorId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (admission.photoPublicId) await deleteFromCloudinary(admission.photoPublicId);

        if (admission.isUserCreated) {
            await User.findOneAndDelete({ email: admission.email });
        }

        await admission.deleteOne();
        res.json({ success: true, message: 'Admission deleted successfully' });
    } catch (error) {
        console.error('🔴 deleteAdmission error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get admissions by counselor for dashboard (tracking)
// @route   GET /api/admissions/counselor/:counselorId
export const getAdmissionsByCounselorForDashboard = async (req, res) => {
    try {
        const counselorId = req.params.counselorId || req.user._id;
        
        const admissions = await Admission.find({ counselorId })
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

// @desc    Get counselor wise admission statistics (Admin report)
// @route   GET /api/admissions/counselor-stats
export const getCounselorWiseAdmissionStats = async (req, res) => {
    try {
        // ✅ Admin only
        if (req.user.role !== 'admin_manager' && req.user.role !== 'super_admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin access required.' 
            });
        }
        
        const stats = await Admission.aggregate([
            {
                $group: {
                    _id: '$counselorId',
                    totalAdmissions: { $sum: 1 },
                    activeAdmissions: { 
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } 
                    },
                    completedAdmissions: { 
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'counselor'
                }
            },
            {
                $unwind: '$counselor'
            },
            {
                $project: {
                    counselorId: '$_id',
                    counselorName: '$counselor.name',
                    counselorEmail: '$counselor.email',
                    totalAdmissions: 1,
                    activeAdmissions: 1,
                    completedAdmissions: 1
                }
            },
            { $sort: { totalAdmissions: -1 } }
        ]);
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('getCounselorWiseAdmissionStats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Alias for compatibility
export const getAdmissions = getAllAdmissions;