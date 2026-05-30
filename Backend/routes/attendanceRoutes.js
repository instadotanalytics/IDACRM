import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// CREATE / UPDATE ATTENDANCE
// ============================================

// @route   POST /api/attendance/mark
// @desc    Mark or update attendance (Admin Manager & Trainer both can use)
router.post('/mark', protect, async (req, res) => {
    try {
        const { studentId, batchId, date, status, clockIn, clockOut, remarks } = req.body;
        
        // Check if attendance already exists
        let attendance = await Attendance.findOne({ 
            studentId, 
            date: new Date(date) 
        });
        
        // Calculate working hours
        let workingHours = '';
        if (clockIn && clockOut) {
            const inTime = new Date(`1970-01-01T${clockIn}:00`);
            const outTime = new Date(`1970-01-01T${clockOut}:00`);
            const diff = (outTime - inTime) / (1000 * 60 * 60);
            workingHours = `${diff.toFixed(1)} hrs`;
        }
        
        if (attendance) {
            // Update existing
            attendance.status = status;
            attendance.clockIn = clockIn || attendance.clockIn;
            attendance.clockOut = clockOut || attendance.clockOut;
            attendance.workingHours = workingHours || attendance.workingHours;
            attendance.remarks = remarks || attendance.remarks;
            attendance.markedBy = req.user.id;
            await attendance.save();
            return res.json({ success: true, message: 'Attendance updated', data: attendance });
        } else {
            // Create new
            attendance = await Attendance.create({
                studentId,
                batchId,
                date: new Date(date),
                status,
                clockIn: clockIn || '',
                clockOut: clockOut || '',
                workingHours,
                remarks: remarks || '',
                markedBy: req.user.id
            });
            return res.status(201).json({ success: true, message: 'Attendance marked', data: attendance });
        }
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// BULK ATTENDANCE
// ============================================

// @route   POST /api/attendance/bulk-mark
// @desc    Bulk mark attendance for multiple students
router.post('/bulk-mark', protect, async (req, res) => {
    try {
        const { records, batchId, date, defaultStatus = 'Present' } = req.body;
        
        const results = { created: 0, updated: 0 };
        
        for (const record of records) {
            let attendance = await Attendance.findOne({ 
                studentId: record.studentId, 
                date: new Date(date) 
            });
            
            if (attendance) {
                attendance.status = record.status || defaultStatus;
                attendance.markedBy = req.user.id;
                await attendance.save();
                results.updated++;
            } else {
                await Attendance.create({
                    studentId: record.studentId,
                    batchId: batchId,
                    date: new Date(date),
                    status: record.status || defaultStatus,
                    markedBy: req.user.id
                });
                results.created++;
            }
        }
        
        res.json({ 
            success: true, 
            message: `${results.created} created, ${results.updated} updated`,
            data: results 
        });
    } catch (error) {
        console.error('Bulk mark error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET ATTENDANCE - ADMIN VIEW
// ============================================

// @route   GET /api/attendance/admin/overview
// @desc    Get all attendance with filters (Admin Manager)
router.get('/admin/overview', protect, async (req, res) => {
    try {
        const { batchId, startDate, endDate, status, studentName } = req.query;
        
        let match = {};
        if (batchId && batchId !== 'all') match.batchId = batchId;
        if (status && status !== 'all') match.status = status;
        
        if (startDate && endDate) {
            match.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        let attendanceQuery = Attendance.find(match)
            .populate('studentId', 'name email phone')
            .populate('batchId', 'name code')
            .sort('-date');
        
        let attendance = await attendanceQuery;
        
        // Filter by student name if provided
        if (studentName) {
            attendance = attendance.filter(a => 
                a.studentId?.name?.toLowerCase().includes(studentName.toLowerCase())
            );
        }
        
        // Batch-wise summary
        const batchSummary = await Attendance.aggregate([
            { $match: match },
            { $group: {
                _id: '$batchId',
                total: { $sum: 1 },
                present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
                absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
                leave: { $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] } },
                late: { $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] } }
            }},
            { $lookup: { from: 'batches', localField: '_id', foreignField: '_id', as: 'batchInfo' } }
        ]);
        
        // Student-wise summary for top performers
        const studentSummary = await Attendance.aggregate([
            { $match: match },
            { $group: {
                _id: '$studentId',
                total: { $sum: 1 },
                present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
                absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } }
            }},
            { $addFields: { percentage: { $multiply: [{ $divide: ['$present', '$total'] }, 100] } } },
            { $sort: { percentage: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'studentInfo' } }
        ]);
        
        res.json({ 
            success: true, 
            data: { attendance, batchSummary, studentSummary }
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET ATTENDANCE - TRAINER VIEW
// ============================================

// @route   GET /api/attendance/batch/:batchId
// @desc    Get attendance for trainer's specific batch on a date
router.get('/batch/:batchId', protect, async (req, res) => {
    try {
        const { batchId } = req.params;
        const { date } = req.query;
        
        const queryDate = date ? new Date(date) : new Date();
        queryDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(queryDate);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // Get all active students in this batch
        const students = await Student.find({ batchId, status: 'active' }).select('name email phone');
        
        // Get existing attendance for this date
        const attendanceRecords = await Attendance.find({
            batchId,
            date: { $gte: queryDate, $lt: nextDate }
        });
        
        // Combine data
        const attendanceData = students.map(student => {
            const existing = attendanceRecords.find(a => a.studentId.toString() === student._id.toString());
            return {
                studentId: student._id,
                studentName: student.name,
                studentEmail: student.email,
                attendanceId: existing?._id || null,
                status: existing?.status || 'Present',
                clockIn: existing?.clockIn || '',
                clockOut: existing?.clockOut || '',
                workingHours: existing?.workingHours || '',
                remarks: existing?.remarks || '',
                isMarked: !!existing
            };
        });
        
        // Batch info
        const batch = await Batch.findById(batchId).select('name code timings');
        
        res.json({ 
            success: true, 
            data: { 
                batch, 
                date: queryDate,
                students: attendanceData,
                totalStudents: students.length,
                markedCount: attendanceRecords.length
            } 
        });
    } catch (error) {
        console.error('Get batch attendance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// STATS FOR ADMIN DASHBOARD
// ============================================

// @route   GET /api/attendance/admin/stats
// @desc    Get attendance statistics for admin dashboard
router.get('/admin/stats', protect, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Today's attendance stats
        const todayAttendance = await Attendance.find({
            date: { $gte: today, $lt: tomorrow }
        });
        
        // Total students
        const totalStudents = await Student.countDocuments({ status: 'active' });
        
        // Overall attendance percentage (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const last30DaysAttendance = await Attendance.find({
            date: { $gte: thirtyDaysAgo }
        });
        
        const totalPresentLast30Days = last30DaysAttendance.filter(a => a.status === 'Present').length;
        const attendancePercentage = last30DaysAttendance.length > 0 
            ? ((totalPresentLast30Days / last30DaysAttendance.length) * 100).toFixed(1)
            : 0;
        
        const stats = {
            totalPresent: todayAttendance.filter(a => a.status === 'Present').length,
            totalAbsent: todayAttendance.filter(a => a.status === 'Absent').length,
            leaveRequests: todayAttendance.filter(a => a.status === 'Leave').length,
            lateEntries: todayAttendance.filter(a => a.status === 'Late').length,
            attendancePercentage: attendancePercentage,
            totalStudents: totalStudents
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DELETE ATTENDANCE (Admin only)
// ============================================

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record (Admin Manager only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance not found' });
        }
        
        await attendance.deleteOne();
        res.json({ success: true, message: 'Attendance deleted successfully' });
    } catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// UPDATE ATTENDANCE (Admin only)
// ============================================

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
router.put('/:id', protect, async (req, res) => {
    try {
        const { status, clockIn, clockOut, remarks } = req.body;
        
        let workingHours = '';
        if (clockIn && clockOut) {
            const inTime = new Date(`1970-01-01T${clockIn}:00`);
            const outTime = new Date(`1970-01-01T${clockOut}:00`);
            const diff = (outTime - inTime) / (1000 * 60 * 60);
            workingHours = `${diff.toFixed(1)} hrs`;
        }
        
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            { status, clockIn, clockOut, workingHours, remarks, markedBy: req.user.id },
            { new: true }
        );
        
        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance not found' });
        }
        
        res.json({ success: true, message: 'Attendance updated', data: attendance });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;