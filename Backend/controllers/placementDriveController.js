import PlacementDrive from '../models/PlacementDrive.js';
import Company from '../models/Company.js';

// @desc    Get all placement drives
// @route   GET /api/placement-drives
export const getPlacementDrives = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, company, fromDate, toDate } = req.query;
        
        let query = { isDeleted: false };
        
        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { driveTitle: { $regex: search, $options: 'i' } },
                { requiredSkills: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status && status !== 'all') query.status = status;
        if (company) query.company = company;
        
        if (fromDate || toDate) {
            query.driveDate = {};
            if (fromDate) query.driveDate.$gte = new Date(fromDate);
            if (toDate) query.driveDate.$lte = new Date(toDate);
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [drives, total] = await Promise.all([
            PlacementDrive.find(query)
                .populate('company', 'companyName industry location')
                .sort({ driveDate: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            PlacementDrive.countDocuments(query)
        ]);
        
        // Get stats
        const stats = {
            total: await PlacementDrive.countDocuments({ isDeleted: false }),
            upcoming: await PlacementDrive.countDocuments({ status: 'Upcoming', isDeleted: false }),
            ongoing: await PlacementDrive.countDocuments({ status: 'Ongoing', isDeleted: false }),
            completed: await PlacementDrive.countDocuments({ status: 'Completed', isDeleted: false }),
            cancelled: await PlacementDrive.countDocuments({ status: 'Cancelled', isDeleted: false }),
            totalStudentsApplied: await PlacementDrive.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: null, total: { $sum: '$studentsApplied' } } }
            ]),
            totalStudentsSelected: await PlacementDrive.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: null, total: { $sum: '$studentsSelected' } } }
            ])
        };
        
        res.json({
            success: true,
            data: drives,
            stats: {
                total: stats.total,
                upcoming: stats.upcoming,
                ongoing: stats.ongoing,
                completed: stats.completed,
                cancelled: stats.cancelled,
                totalStudentsApplied: stats.totalStudentsApplied[0]?.total || 0,
                totalStudentsSelected: stats.totalStudentsSelected[0]?.total || 0
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Get placement drives error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single placement drive
// @route   GET /api/placement-drives/:id
export const getPlacementDriveById = async (req, res) => {
    try {
        const drive = await PlacementDrive.findOne({ 
            _id: req.params.id, 
            isDeleted: false 
        }).populate('company', 'companyName industry location email phone');
        
        if (!drive) {
            return res.status(404).json({ success: false, message: 'Placement drive not found' });
        }
        
        res.json({ success: true, data: drive });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create placement drive
// @route   POST /api/placement-drives
export const createPlacementDrive = async (req, res) => {
    try {
        const { companyId, ...driveData } = req.body;
        const user = req.user;
        
        // Get company details
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        
        const drive = await PlacementDrive.create({
            ...driveData,
            company: companyId,
            companyName: company.companyName,
            createdBy: user._id,
            createdByName: user.name || user.username
        });
        
        res.status(201).json({
            success: true,
            data: drive,
            message: 'Placement drive created successfully'
        });
        
    } catch (error) {
        console.error('Create placement drive error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update placement drive
// @route   PUT /api/placement-drives/:id
export const updatePlacementDrive = async (req, res) => {
    try {
        const drive = await PlacementDrive.findById(req.params.id);
        
        if (!drive || drive.isDeleted) {
            return res.status(404).json({ success: false, message: 'Placement drive not found' });
        }
        
        const updatedDrive = await PlacementDrive.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            data: updatedDrive,
            message: 'Placement drive updated successfully'
        });
        
    } catch (error) {
        console.error('Update placement drive error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete placement drive (soft delete)
// @route   DELETE /api/placement-drives/:id
export const deletePlacementDrive = async (req, res) => {
    try {
        const drive = await PlacementDrive.findById(req.params.id);
        
        if (!drive || drive.isDeleted) {
            return res.status(404).json({ success: false, message: 'Placement drive not found' });
        }
        
        drive.isDeleted = true;
        await drive.save();
        
        res.json({
            success: true,
            message: 'Placement drive deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete placement drive error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get placement drive stats
// @route   GET /api/placement-drives/stats
export const getPlacementDriveStats = async (req, res) => {
    try {
        const matchCondition = { isDeleted: false };
        
        const statusWise = await PlacementDrive.aggregate([
            { $match: matchCondition },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        const monthlyDrives = await PlacementDrive.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: {
                        year: { $year: '$driveDate' },
                        month: { $month: '$driveDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 }
        ]);
        
        res.json({
            success: true,
            data: {
                statusWise,
                monthlyDrives
            }
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Register student for drive
// @route   POST /api/placement-drives/:id/register
export const registerStudent = async (req, res) => {
    try {
        const { studentId, studentName, studentEmail } = req.body;
        const drive = await PlacementDrive.findById(req.params.id);
        
        if (!drive || drive.isDeleted) {
            return res.status(404).json({ success: false, message: 'Placement drive not found' });
        }
        
        // Check if already registered
        const alreadyRegistered = drive.registeredStudents.some(
            s => s.studentId.toString() === studentId
        );
        
        if (alreadyRegistered) {
            return res.status(400).json({ success: false, message: 'Student already registered' });
        }
        
        drive.registeredStudents.push({
            studentId,
            studentName,
            studentEmail,
            status: 'Registered'
        });
        drive.studentsApplied += 1;
        await drive.save();
        
        res.json({
            success: true,
            message: 'Student registered successfully'
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};