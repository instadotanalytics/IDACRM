import HRInterview from '../models/hrInterview.model.js';
import HRStudent from '../models/hrStudents.model.js';
import Company from '../models/Company.js';

// @desc    Get all interviews with stats
// @route   GET /api/hr-interviews
export const getInterviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, fromDate, toDate } = req.query;
        
        let query = { isDeleted: false };
        
        if (search) {
            query.$or = [
                { studentName: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { studentRollNo: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status && status !== 'all') query.status = status;
        
        if (fromDate || toDate) {
            query.interviewDate = {};
            if (fromDate) query.interviewDate.$gte = new Date(fromDate);
            if (toDate) query.interviewDate.$lte = new Date(toDate);
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [interviews, total] = await Promise.all([
            HRInterview.find(query)
                .populate('student', 'studentName studentEmail studentRollNo studentPhone')
                .populate('company', 'companyName industry')
                .sort({ interviewDate: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            HRInterview.countDocuments(query)
        ]);
        
        // Enhanced Stats with Result Tracking
        const stats = {
            total: await HRInterview.countDocuments({ isDeleted: false }),
            scheduled: await HRInterview.countDocuments({ status: 'Scheduled', isDeleted: false }),
            completed: await HRInterview.countDocuments({ status: 'Completed', isDeleted: false }),
            selected: await HRInterview.countDocuments({ status: 'Selected', isDeleted: false }),
            rejected: await HRInterview.countDocuments({ status: 'Rejected', isDeleted: false }),
            cancelled: await HRInterview.countDocuments({ status: 'Cancelled', isDeleted: false }),
            today: await HRInterview.countDocuments({
                interviewDate: {
                    $gte: new Date().setHours(0, 0, 0, 0),
                    $lte: new Date().setHours(23, 59, 59, 999)
                },
                isDeleted: false
            }),
            // New Stats for Result Tracking
            avgPackage: await HRInterview.aggregate([
                { $match: { status: 'Selected', isDeleted: false, offeredPackage: { $gt: 0 } } },
                { $group: { _id: null, avg: { $avg: '$offeredPackage' } } }
            ]),
            monthlySelected: await HRInterview.aggregate([
                { $match: { status: 'Selected', isDeleted: false } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$resultDate' },
                            month: { $month: '$resultDate' }
                        },
                        count: { $sum: 1 },
                        avgPackage: { $avg: '$offeredPackage' }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 6 }
            ]),
            companyWiseSelection: await HRInterview.aggregate([
                { $match: { status: 'Selected', isDeleted: false } },
                {
                    $group: {
                        _id: '$company',
                        companyName: { $first: '$companyName' },
                        selectedCount: { $sum: 1 },
                        avgPackage: { $avg: '$offeredPackage' }
                    }
                },
                { $sort: { selectedCount: -1 } },
                { $limit: 10 }
            ])
        };
        
        res.json({
            success: true,
            data: interviews,
            stats: {
                total: stats.total,
                scheduled: stats.scheduled,
                completed: stats.completed,
                selected: stats.selected,
                rejected: stats.rejected,
                cancelled: stats.cancelled,
                today: stats.today,
                avgPackage: stats.avgPackage[0]?.avg || 0,
                monthlySelected: stats.monthlySelected,
                companyWiseSelection: stats.companyWiseSelection
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Get interviews error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create interview
// @route   POST /api/hr-interviews
export const createInterview = async (req, res) => {
    try {
        const { studentId, companyId, ...interviewData } = req.body;
        const user = req.user;
        
        const student = await HRStudent.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        
        const interview = await HRInterview.create({
            ...interviewData,
            student: studentId,
            studentId: studentId,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            studentRollNo: student.studentRollNo,
            studentPhone: student.studentPhone,
            company: companyId,
            companyId: companyId,
            companyName: company.companyName,
            createdBy: user._id,
            createdByName: user.name
        });
        
        res.status(201).json({
            success: true,
            data: interview,
            message: 'Interview scheduled successfully'
        });
        
    } catch (error) {
        console.error('Create interview error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update interview status with result
// @route   PUT /api/hr-interviews/:id/status
export const updateInterviewStatus = async (req, res) => {
    try {
        const { 
            status, 
            feedback, 
            rating, 
            technicalScore, 
            communicationScore,
            offeredPackage,
            resultDate,
            joiningDate,
            offerLetterSent,
            remarks 
        } = req.body;
        
        const interview = await HRInterview.findById(req.params.id);
        
        if (!interview || interview.isDeleted) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }
        
        const updateData = { 
            status,
            updatedBy: req.user._id,
            updatedByName: req.user.name
        };
        
        if (feedback) updateData.feedback = feedback;
        if (rating) updateData.rating = parseInt(rating);
        if (technicalScore) updateData.technicalScore = parseInt(technicalScore);
        if (communicationScore) updateData.communicationScore = parseInt(communicationScore);
        if (remarks) updateData.remarks = remarks;
        
        // Calculate overall score
        if (technicalScore && communicationScore) {
            updateData.overallScore = Math.round((parseInt(technicalScore) + parseInt(communicationScore)) / 2);
        }
        
        // If status is Selected, add placement details
        if (status === 'Selected') {
            updateData.resultDate = resultDate || new Date();
            updateData.offeredPackage = parseFloat(offeredPackage) || 0;
            updateData.joiningDate = joiningDate || null;
            updateData.offerLetterSent = offerLetterSent || false;
            if (offerLetterSent) {
                updateData.offerLetterDate = new Date();
            }
            
            // Update student as placed
            if (interview.studentId || interview.student) {
                const studentId = interview.studentId || interview.student;
                await HRStudent.findByIdAndUpdate(studentId, {
                    placementStatus: 'Placed',
                    placedCompany: interview.companyId || interview.company,
                    placedCompanyName: interview.companyName,
                    placedPackage: parseFloat(offeredPackage) || 0,
                    placedDate: resultDate || new Date()
                });
            }
        }
        
        // If status is Rejected, update student status
        if (status === 'Rejected') {
            updateData.resultDate = resultDate || new Date();
        }
        
        const updatedInterview = await HRInterview.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            data: updatedInterview,
            message: `Interview ${status === 'Selected' ? 'marked as SELECTED and student placed!' : `marked as ${status}`}`
        });
        
    } catch (error) {
        console.error('Update interview status error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get interview by ID
// @route   GET /api/hr-interviews/:id
export const getInterviewById = async (req, res) => {
    try {
        const interview = await HRInterview.findOne({ 
            _id: req.params.id, 
            isDeleted: false 
        })
        .populate('student', 'studentName studentEmail studentRollNo studentPhone studentPlacementStatus')
        .populate('company', 'companyName industry location email phone');
        
        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }
        
        res.json({ success: true, data: interview });
        
    } catch (error) {
        console.error('Get interview error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete interview
// @route   DELETE /api/hr-interviews/:id
export const deleteInterview = async (req, res) => {
    try {
        const interview = await HRInterview.findById(req.params.id);
        
        if (!interview || interview.isDeleted) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }
        
        interview.isDeleted = true;
        await interview.save();
        
        res.json({ success: true, message: 'Interview deleted successfully' });
        
    } catch (error) {
        console.error('Delete interview error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get result analytics
// @route   GET /api/hr-interviews/analytics
export const getResultAnalytics = async (req, res) => {
    try {
        const analytics = {
            totalInterviews: await HRInterview.countDocuments({ isDeleted: false }),
            selectionRate: await HRInterview.aggregate([
                { $match: { isDeleted: false } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        selected: { $sum: { $cond: [{ $eq: ['$status', 'Selected'] }, 1, 0] } }
                    }
                }
            ]),
            topCompanies: await HRInterview.aggregate([
                { $match: { status: 'Selected', isDeleted: false } },
                {
                    $group: {
                        _id: '$company',
                        companyName: { $first: '$companyName' },
                        selections: { $sum: 1 },
                        avgPackage: { $avg: '$offeredPackage' }
                    }
                },
                { $sort: { selections: -1 } },
                { $limit: 5 }
            ]),
            monthlyTrend: await HRInterview.aggregate([
                { $match: { isDeleted: false } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$interviewDate' },
                            month: { $month: '$interviewDate' }
                        },
                        total: { $sum: 1 },
                        selected: { $sum: { $cond: [{ $eq: ['$status', 'Selected'] }, 1, 0] } }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 6 }
            ])
        };
        
        res.json({ success: true, data: analytics });
        
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};