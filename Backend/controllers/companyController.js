import Company from '../models/Company.js';
import ActivityLog from '../models/ActivityLog.js';

// Helper function to log activities
const logActivity = async (action, entityId, entityName, changes, req, additionalInfo = {}) => {
    try {
        const user = req.user;
        await ActivityLog.create({
            action,
            entityType: 'COMPANY',
            entityId,
            entityName,
            changes,
            performedBy: {
                userId: user._id,
                userName: user.name || user.username,
                userEmail: user.email,
                userRole: user.role
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            ...additionalInfo
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// @desc    Get all companies
// @route   GET /api/companies
export const getCompanies = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, industry, location, status } = req.query;
        
        let query = { isDeleted: false };
        
        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { hrName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (industry && industry !== 'all') query.industry = industry;
        if (location && location !== 'all') query.location = { $regex: location, $options: 'i' };
        if (status && status !== 'all') query.status = status;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [companies, total] = await Promise.all([
            Company.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('createdBy', 'name email role')
                .populate('updatedBy', 'name email'),
            Company.countDocuments(query)
        ]);
        
        // Calculate stats
        const stats = {
            total: await Company.countDocuments({ isDeleted: false }),
            active: await Company.countDocuments({ status: 'Active', isDeleted: false }),
            hiring: await Company.countDocuments({ status: 'Hiring', isDeleted: false }),
            inactive: await Company.countDocuments({ status: 'Inactive', isDeleted: false }),
            closed: await Company.countDocuments({ status: 'Closed', isDeleted: false }),
            totalOpenRoles: await Company.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: null, total: { $sum: '$openRoles' } } }
            ]),
            // HR Stats - Kitne companies kis HR ne add ki
            hrStats: await Company.aggregate([
                { $match: { isDeleted: false } },
                {
                    $group: {
                        _id: '$createdBy',
                        name: { $first: '$createdByName' },
                        email: { $first: '$createdByEmail' },
                        companyCount: { $sum: 1 },
                        totalOpenRoles: { $sum: '$openRoles' }
                    }
                },
                { $sort: { companyCount: -1 } }
            ])
        };
        
        // Log view action (optional - can be commented if too many logs)
        // await logActivity('VIEW', null, null, null, req);
        
        res.json({
            success: true,
            data: companies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            stats: {
                total: stats.total,
                active: stats.active,
                hiring: stats.hiring,
                inactive: stats.inactive,
                closed: stats.closed,
                totalOpenRoles: stats.totalOpenRoles[0]?.total || 0,
                hrStats: stats.hrStats
            }
        });
        
    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get company stats for dashboard
// @route   GET /api/companies/stats
export const getCompanyStats = async (req, res) => {
    try {
        const matchCondition = { isDeleted: false };
        
        const statusWise = await Company.aggregate([
            { $match: matchCondition },
            { 
                $group: { 
                    _id: '$status', 
                    count: { $sum: 1 },
                    totalOpenRoles: { $sum: '$openRoles' }
                } 
            }
        ]);
        
        const total = await Company.countDocuments(matchCondition);
        const totalOpenRoles = await Company.aggregate([
            { $match: matchCondition },
            { $group: { _id: null, total: { $sum: '$openRoles' } } }
        ]);
        
        // HR Performance Stats
        const hrPerformance = await Company.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$createdBy',
                    hrName: { $first: '$createdByName' },
                    hrEmail: { $first: '$createdByEmail' },
                    companiesAdded: { $sum: 1 },
                    totalOpenRoles: { $sum: '$openRoles' },
                    activeCompanies: {
                        $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
                    },
                    hiringCompanies: {
                        $sum: { $cond: [{ $eq: ['$status', 'Hiring'] }, 1, 0] }
                    }
                }
            },
            { $sort: { companiesAdded: -1 } }
        ]);
        
        res.json({
            success: true,
            data: {
                stats: statusWise,
                total: total,
                totalOpenRoles: totalOpenRoles[0]?.total || 0,
                hrPerformance: hrPerformance
            }
        });
        
    } catch (error) {
        console.error('Get company stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create company
// @route   POST /api/companies
export const createCompany = async (req, res) => {
    try {
        const { companyName, email } = req.body;
        const user = req.user;
        
        const existingCompany = await Company.findOne({ 
            $or: [{ companyName: companyName.trim() }, { email: email.toLowerCase() }],
            isDeleted: false 
        });
        
        if (existingCompany) {
            return res.status(400).json({ 
                success: false, 
                message: 'Company with this name or email already exists' 
            });
        }
        
        const company = await Company.create({
            ...req.body,
            email: email.toLowerCase(),
            createdBy: user._id,
            createdByName: user.name || user.username,
            createdByEmail: user.email
        });
        
        // Log activity
        await logActivity('CREATE', company._id, company.companyName, { 
            companyData: req.body 
        }, req);
        
        res.status(201).json({
            success: true,
            data: company,
            message: 'Company created successfully',
            createdBy: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update company
// @route   PUT /api/companies/:id
export const updateCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        const user = req.user;
        
        if (!company || company.isDeleted) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        
        // Track changes
        const changes = {};
        Object.keys(req.body).forEach(key => {
            if (company[key] !== req.body[key]) {
                changes[key] = {
                    old: company[key],
                    new: req.body[key]
                };
            }
        });
        
        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            { 
                ...req.body,
                updatedBy: user._id,
                updatedByName: user.name || user.username,
                updatedByEmail: user.email
            },
            { new: true, runValidators: true }
        );
        
        // Log activity
        await logActivity('UPDATE', company._id, company.companyName, changes, req);
        
        res.json({
            success: true,
            data: updatedCompany,
            message: 'Company updated successfully',
            updatedBy: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete company (soft delete)
// @route   DELETE /api/companies/:id
export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        const user = req.user;
        
        if (!company || company.isDeleted) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        
        company.isDeleted = true;
        company.deletedBy = user._id;
        company.deletedByName = user.name || user.username;
        company.deletedAt = new Date();
        await company.save();
        
        // Log activity
        await logActivity('DELETE', company._id, company.companyName, { 
            deletedReason: req.body.reason || 'No reason provided'
        }, req);
        
        res.json({
            success: true,
            message: 'Company deleted successfully',
            deletedBy: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get activity logs for a company
// @route   GET /api/companies/:id/activities
export const getCompanyActivities = async (req, res) => {
    try {
        const activities = await ActivityLog.find({ entityId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(50);
        
        res.json({
            success: true,
            data: activities
        });
        
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get HR performance report
// @route   GET /api/companies/hr-performance
export const getHRPerformance = async (req, res) => {
    try {
        const hrPerformance = await Company.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: '$createdBy',
                    hrName: { $first: '$createdByName' },
                    hrEmail: { $first: '$createdByEmail' },
                    companiesAdded: { $sum: 1 },
                    totalOpenRoles: { $sum: '$openRoles' },
                    activeCompanies: {
                        $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
                    },
                    hiringCompanies: {
                        $sum: { $cond: [{ $eq: ['$status', 'Hiring'] }, 1, 0] }
                    },
                    companies: { $push: { name: '$companyName', status: '$status' } }
                }
            },
            { $sort: { companiesAdded: -1 } }
        ]);
        
        // Get activity stats per HR
        const activityStats = await ActivityLog.aggregate([
            {
                $group: {
                    _id: '$performedBy.userId',
                    totalActions: { $sum: 1 },
                    createActions: {
                        $sum: { $cond: [{ $eq: ['$action', 'CREATE'] }, 1, 0] }
                    },
                    updateActions: {
                        $sum: { $cond: [{ $eq: ['$action', 'UPDATE'] }, 1, 0] }
                    },
                    deleteActions: {
                        $sum: { $cond: [{ $eq: ['$action', 'DELETE'] }, 1, 0] }
                    }
                }
            }
        ]);
        
        res.json({
            success: true,
            data: {
                hrPerformance,
                activityStats
            }
        });
        
    } catch (error) {
        console.error('Get HR performance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};