import express from 'express';
import Attendance from '../models/Attendance.js';
import Admission from '../models/Admission.js';  // ✅ CHANGED: Student → Admission
import Batch from '../models/Batch.js';
import { protect, trainerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(trainerOnly);

// ==================== SAVE BULK ATTENDANCE ====================
router.post('/bulk', async (req, res) => {
    try {
        const { records } = req.body;
        
        if (!records || records.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No attendance records provided' 
            });
        }

        const savedRecords = [];
        
        for (const record of records) {
            const attendanceDate = new Date(record.date);
            attendanceDate.setHours(0, 0, 0, 0);
            
            // Normalize status to proper case
            const normalizedStatus = record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase();
            
            let attendance = await Attendance.findOne({
                studentId: record.studentId,
                date: attendanceDate
            });
            
            if (attendance) {
                attendance.status = normalizedStatus;
                attendance.remarks = record.remarks || '';
                attendance.markedBy = req.user._id;
                await attendance.save();
                savedRecords.push(attendance);
            } else {
                attendance = await Attendance.create({
                    studentId: record.studentId,
                    batchId: record.batchId,
                    date: attendanceDate,
                    status: normalizedStatus,
                    remarks: record.remarks || '',
                    markedBy: req.user._id
                });
                savedRecords.push(attendance);
            }
        }
        
        res.json({
            success: true,
            data: savedRecords,
            message: `Attendance saved for ${savedRecords.length} students`
        });
        
    } catch (error) {
        console.error('Error saving bulk attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== GET ATTENDANCE ====================
router.get('/', async (req, res) => {
    try {
        const { batchId, date, studentId } = req.query;
        
        let query = {};
        if (batchId) query.batchId = batchId;
        if (studentId) query.studentId = studentId;
        
        if (date) {
            const searchDate = new Date(date);
            searchDate.setHours(0, 0, 0, 0);
            query.date = searchDate;
        }
        
        const attendance = await Attendance.find(query)
            .populate('studentId', 'name email enrollmentId photo')
            .populate('batchId', 'name code')
            .populate('markedBy', 'name')
            .sort({ date: -1 });
        
        res.json({ success: true, data: attendance });
        
    } catch (error) {
        console.error('Error getting attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== MONTHLY REPORT - FIXED ====================
router.get('/batch/monthly', async (req, res) => {
    try {
        const { batchId } = req.query;
        
        if (!batchId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Batch ID is required' 
            });
        }
        
        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ 
                success: false, 
                message: 'Batch not found' 
            });
        }
        
        // ✅ CHANGED: Student.find → Admission.find
        // Kyunki attendance save karte waqt Admission._id use hota hai, Student._id nahi
        const students = await Admission.find({ batchId: batchId });
        
        if (students.length === 0) {
            return res.json({ 
                success: true, 
                data: [],
                message: 'No students found in this batch'
            });
        }
        
        const allAttendance = await Attendance.find({ batchId: batchId });
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        const currentMonthAttendance = allAttendance.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getFullYear() === currentYear && recordDate.getMonth() === currentMonth;
        });
        
        console.log('Total attendance records this month:', currentMonthAttendance.length);
        
        const uniqueDates = new Set();
        currentMonthAttendance.forEach(record => {
            const date = new Date(record.date);
            uniqueDates.add(date.toDateString());
        });
        const totalWorkingDays = uniqueDates.size || 1;
        
        const studentStats = students.map(student => {
            const studentAttendance = currentMonthAttendance.filter(record => {
                // ✅ FIXED: Ab dono Admission._id se compare ho rahe hain — match hoga
                return record.studentId.toString() === student._id.toString();
            });
            
            const present = studentAttendance.filter(r => 
                r.status === 'Present' || r.status === 'present' || r.status === 'PRESENT'
            ).length;
            const absent = studentAttendance.filter(r => 
                r.status === 'Absent' || r.status === 'absent' || r.status === 'ABSENT'
            ).length;
            const leave = studentAttendance.filter(r => 
                r.status === 'Leave' || r.status === 'leave' || r.status === 'LEAVE'
            ).length;
            const late = studentAttendance.filter(r => 
                r.status === 'Late' || r.status === 'late' || r.status === 'LATE'
            ).length;
            
            const total = present + absent + leave + late;
            const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
            
            console.log(`${student.name}: Present=${present}, Absent=${absent}, Leave=${leave}, Late=${late}`);
            
            return {
                id: student._id,
                name: student.name,
                email: student.email,
                enrollmentId: student.enrollmentId || '',
                present,
                absent,
                leave,
                late,
                total,
                percentage: parseFloat(percentage)
            };
        });
        
        const totalPresent = studentStats.reduce((sum, s) => sum + s.present, 0);
        const totalAbsent = studentStats.reduce((sum, s) => sum + s.absent, 0);
        const totalLeave = studentStats.reduce((sum, s) => sum + s.leave, 0);
        const totalLate = studentStats.reduce((sum, s) => sum + s.late, 0);
        
        const totalPossibleAttendance = totalWorkingDays * students.length;
        const overallPercentage = totalPossibleAttendance > 0 
            ? ((totalPresent / totalPossibleAttendance) * 100).toFixed(1) 
            : 0;
        
        const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const result = [{
            month: monthName,
            totalDays: totalWorkingDays,
            present: totalPresent,
            absent: totalAbsent,
            leave: totalLeave,
            late: totalLate,
            percentage: parseFloat(overallPercentage),
            students: studentStats
        }];
        
        console.log('Final Monthly Report:', JSON.stringify(result, null, 2));
        
        res.json({ success: true, data: result });
        
    } catch (error) {
        console.error('Error in monthly report:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ==================== UPDATE ATTENDANCE ====================
router.put('/:id', async (req, res) => {
    try {
        const normalizedStatus = req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1).toLowerCase();
        
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            {
                status: normalizedStatus,
                remarks: req.body.remarks,
                markedBy: req.user._id
            },
            { new: true }
        );
        
        if (!attendance) {
            return res.status(404).json({ 
                success: false, 
                message: 'Attendance not found' 
            });
        }
        
        res.json({ success: true, data: attendance });
        
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== DELETE ATTENDANCE ====================
router.delete('/:id', async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);
        
        if (!attendance) {
            return res.status(404).json({ 
                success: false, 
                message: 'Attendance not found' 
            });
        }
        
        res.json({ success: true, message: 'Attendance deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;