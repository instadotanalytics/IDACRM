import HRDailyReport from '../models/hrReportmodel.js';
import User from '../models/User.js';

// @desc    Generate/Create Report
// @route   POST /api/hr-reports
export const generateReport = async (req, res) => {
    try {
        const {
            employeeId, employeeName, employeeEmail, employeeRole,
            reportTitle, reportContent, tasksCompleted,
            hoursWorked, productivityScore, challenges, tomorrowPlan, needSupport
        } = req.body;

        // Validation
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: 'Please select an employee'
            });
        }
        if (!reportTitle) {
            return res.status(400).json({
                success: false,
                message: 'Please enter report title'
            });
        }
        if (!reportContent) {
            return res.status(400).json({
                success: false,
                message: 'Please enter report content'
            });
        }

        const report = await HRDailyReport.create({
            employeeId,
            employeeName,
            employeeEmail,
            employeeRole,
            reportTitle,
            reportContent,
            reportDate: new Date(),
            tasksCompleted: tasksCompleted || [],
            hoursWorked: hoursWorked || 0,
            productivityScore: productivityScore || 0,
            challenges: challenges || '',
            tomorrowPlan: tomorrowPlan || '',
            needSupport: needSupport || '',
            status: 'Submitted',
            createdBy: req.user._id,
            createdByName: req.user.name
        });

        res.status(201).json({
            success: true,
            data: report,
            message: 'Report generated successfully'
        });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get All Reports
// @route   GET /api/hr-reports
export const getDailyReports = async (req, res) => {
    try {
        const { search, employeeId, status, page = 1, limit = 10 } = req.query;
        
        let query = { isDeleted: false };
        
        if (search) {
            query.$or = [
                { employeeName: { $regex: search, $options: 'i' } },
                { reportTitle: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (employeeId && employeeId !== 'all') {
            query.employeeId = employeeId;
        }
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [reports, total] = await Promise.all([
            HRDailyReport.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            HRDailyReport.countDocuments(query)
        ]);
        
        // Dashboard Stats
        const stats = {
            total: await HRDailyReport.countDocuments({ isDeleted: false }),
            today: await HRDailyReport.countDocuments({
                isDeleted: false,
                createdAt: {
                    $gte: new Date().setHours(0, 0, 0, 0)
                }
            }),
            thisWeek: await HRDailyReport.countDocuments({
                isDeleted: false,
                createdAt: {
                    $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                }
            })
        };
        
        // Calculate total hours and average productivity
        const allReports = await HRDailyReport.find({ isDeleted: false });
        const totalHours = allReports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
        const avgProductivity = allReports.length > 0 
            ? (allReports.reduce((sum, r) => sum + (r.productivityScore || 0), 0) / allReports.length).toFixed(1)
            : 0;
        
        res.json({
            success: true,
            data: reports,
            stats: {
                total: stats.total,
                today: stats.today,
                thisWeek: stats.thisWeek,
                totalHours,
                avgProductivity
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get Single Report
// @route   GET /api/hr-reports/:id
export const getDailyReportById = async (req, res) => {
    try {
        const report = await HRDailyReport.findById(req.params.id);

        if (!report || report.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update Report
// @route   PUT /api/hr-reports/:id
export const updateDailyReport = async (req, res) => {
    try {
        const report = await HRDailyReport.findById(req.params.id);

        if (!report || report.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const updatedReport = await HRDailyReport.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user._id },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedReport,
            message: 'Report updated successfully'
        });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete Report
// @route   DELETE /api/hr-reports/:id
export const deleteDailyReport = async (req, res) => {
    try {
        const report = await HRDailyReport.findById(req.params.id);

        if (!report || report.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        report.isDeleted = true;
        await report.save();

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Send Report To Manager
// @route   POST /api/hr-reports/:id/send-to-manager
export const sendReportToManager = async (req, res) => {
    try {
        const report = await HRDailyReport.findById(req.params.id);

        if (!report || report.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        report.status = 'Sent To Manager';
        await report.save();

        res.json({
            success: true,
            message: 'Report sent to manager successfully',
            data: report
        });
    } catch (error) {
        console.error('Send report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mark Report As Viewed
// @route   PUT /api/hr-reports/:id/mark-viewed
export const markReportAsViewed = async (req, res) => {
    try {
        const report = await HRDailyReport.findById(req.params.id);

        if (!report || report.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        report.viewed = true;
        report.viewedAt = new Date();
        report.status = 'Viewed by Manager';
        await report.save();

        res.json({
            success: true,
            message: 'Report marked as viewed',
            data: report
        });
    } catch (error) {
        console.error('Mark viewed error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get Employees List
// @route   GET /api/hr-reports/employees
export const getEmployees = async (req, res) => {
    try {
        const employees = await User.find(
            { isDeleted: { $ne: true } },
            'name email role department'
        ).sort({ name: 1 });
        
        res.json({
            success: true,
            data: employees
        });
    } catch (error) {
        console.error('Get employees error:', error);
        // Mock data if error
        res.json({
            success: true,
            data: [
                { _id: '1', name: 'Amit Sharma', email: 'amit@idacrm.com', role: 'employee', department: 'IT' },
                { _id: '2', name: 'Neha Gupta', email: 'neha@idacrm.com', role: 'employee', department: 'HR' },
                { _id: '3', name: 'Rajesh Verma', email: 'rajesh@idacrm.com', role: 'employee', department: 'Sales' },
                { _id: '4', name: 'Priya Singh', email: 'priya@idacrm.com', role: 'employee', department: 'Marketing' },
                { _id: '5', name: 'Vikram Mehta', email: 'vikram@idacrm.com', role: 'employee', department: 'Development' }
            ]
        });
    }
};

// @desc    Get Dashboard Stats
// @route   GET /api/hr-reports/dashboard-stats
export const getReportDashboardStats = async (req, res) => {
    try {
        const totalReports = await HRDailyReport.countDocuments({
            isDeleted: false
        });

        const todayReports = await HRDailyReport.countDocuments({
            isDeleted: false,
            createdAt: {
                $gte: new Date().setHours(0, 0, 0, 0)
            }
        });

        const thisWeekReports = await HRDailyReport.countDocuments({
            isDeleted: false,
            createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 7))
            }
        });

        const reports = await HRDailyReport.find({ isDeleted: false });

        const totalHours = reports.reduce(
            (sum, report) => sum + (report.hoursWorked || 0),
            0
        );

        const avgProductivity =
            reports.length > 0
                ? (reports.reduce(
                      (sum, report) => sum + (report.productivityScore || 0),
                      0
                  ) / reports.length).toFixed(1)
                : 0;

        const sentToManager = await HRDailyReport.countDocuments({
            isDeleted: false,
            status: 'Sent To Manager'
        });

        const viewedByManager = await HRDailyReport.countDocuments({
            isDeleted: false,
            viewed: true
        });

        res.json({
            success: true,
            data: {
                totalReports,
                todayReports,
                thisWeekReports,
                totalHours,
                avgProductivity,
                sentToManager,
                viewedByManager
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};