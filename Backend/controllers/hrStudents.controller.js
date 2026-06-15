import HRStudent from '../models/hrStudents.model.js';
import HRInterview from '../models/hrInterview.model.js';
import Company from '../models/Company.js';

// @desc    Get all students
// @route   GET /api/hr-students
export const getStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, placementStatus, course, branch } = req.query;
        
        let query = { isDeleted: false };
        
        if (search) {
            query.$or = [
                { studentName: { $regex: search, $options: 'i' } },
                { studentEmail: { $regex: search, $options: 'i' } },
                { studentRollNo: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (placementStatus && placementStatus !== 'all') query.placementStatus = placementStatus;
        if (course && course !== 'all') query.course = course;
        if (branch && branch !== 'all') query.branch = branch;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [students, total] = await Promise.all([
            HRStudent.find(query)
                .populate('placedCompany', 'companyName industry')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            HRStudent.countDocuments(query)
        ]);
        
        // Get stats
        const stats = {
            total: await HRStudent.countDocuments({ isDeleted: false }),
            placed: await HRStudent.countDocuments({ placementStatus: 'Placed', isDeleted: false }),
            notPlaced: await HRStudent.countDocuments({ placementStatus: 'Not Placed', isDeleted: false }),
            inProcess: await HRStudent.countDocuments({ placementStatus: 'In Process', isDeleted: false }),
            avgPackage: await HRStudent.aggregate([
                { $match: { placementStatus: 'Placed', isDeleted: false } },
                { $group: { _id: null, avg: { $avg: '$placedPackage' } } }
            ])
        };
        
        res.json({
            success: true,
            data: students,
            stats: {
                total: stats.total,
                placed: stats.placed,
                notPlaced: stats.notPlaced,
                inProcess: stats.inProcess,
                avgPackage: stats.avgPackage[0]?.avg || 0
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create student
// @route   POST /api/hr-students
export const createStudent = async (req, res) => {
    try {
        const { studentEmail, studentRollNo } = req.body;
        const user = req.user;
        
        const existingStudent = await HRStudent.findOne({
            $or: [{ studentEmail }, { studentRollNo }],
            isDeleted: false
        });
        
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student with this email or roll number already exists'
            });
        }
        
        const student = await HRStudent.create({
            ...req.body,
            createdBy: user._id,
            createdByName: user.name,
            createdByEmail: user.email
        });
        
        res.status(201).json({
            success: true,
            data: student,
            message: 'Student added successfully'
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update student
// @route   PUT /api/hr-students/:id
export const updateStudent = async (req, res) => {
    try {
        const student = await HRStudent.findById(req.params.id);
        
        if (!student || student.isDeleted) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        const updatedStudent = await HRStudent.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user._id, updatedByName: req.user.name },
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            data: updatedStudent,
            message: 'Student updated successfully'
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/hr-students/:id
export const deleteStudent = async (req, res) => {
    try {
        const student = await HRStudent.findById(req.params.id);
        
        if (!student || student.isDeleted) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        student.isDeleted = true;
        await student.save();
        
        res.json({ success: true, message: 'Student deleted successfully' });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark student as placed (ONLY ONE VERSION - REMOVE DUPLICATE)
// @route   POST /api/hr-students/:id/mark-placed
export const markStudentAsPlaced = async (req, res) => {
    try {
        const { companyId, placedPackage, placedDate } = req.body;
        const student = await HRStudent.findById(req.params.id);
        
        if (!student || student.isDeleted) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        
        student.placementStatus = 'Placed';
        student.placedCompany = companyId;
        student.placedCompanyName = company.companyName;
        student.placedPackage = parseFloat(placedPackage);
        student.placedDate = placedDate || new Date();
        
        await student.save();
        
        res.json({
            success: true,
            data: student,
            message: `${student.studentName} marked as placed in ${company.companyName} with ${placedPackage} LPA`
        });
        
    } catch (error) {
        console.error('Mark student placed error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get placement statistics
// @route   GET /api/hr-students/placement-stats
export const getPlacementStats = async (req, res) => {
    try {
        const branchWise = await HRStudent.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: '$branch',
                    total: { $sum: 1 },
                    placed: {
                        $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] }
                    }
                }
            }
        ]);
        
        const companyWise = await HRStudent.aggregate([
            { $match: { placementStatus: 'Placed', isDeleted: false } },
            {
                $group: {
                    _id: '$placedCompany',
                    companyName: { $first: '$placedCompanyName' },
                    count: { $sum: 1 },
                    avgPackage: { $avg: '$placedPackage' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        res.json({
            success: true,
            data: { branchWise, companyWise }
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};