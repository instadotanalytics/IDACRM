import Attendance from '../models/Attendance.js';
import Admission from '../models/Admission.js';
import Batch from '../models/Batch.js';

// ==================== SAVE BULK ATTENDANCE (WITH TRACKING) ====================
export const saveBulkAttendance = async (req, res) => {
    try {
        const { records } = req.body;
        
        if (!records || records.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No attendance records provided' 
            });
        }

        console.log('=========================================');
        console.log('📝 Saving Attendance by Trainer:', req.user.name);
        console.log('🆔 Trainer ID:', req.user._id);
        console.log('📊 Records count:', records.length);
        console.log('=========================================');

        const savedRecords = [];
        
        for (const record of records) {
            const attendanceDate = new Date(record.date);
            attendanceDate.setHours(0, 0, 0, 0);
            
            const normalizedStatus = record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase();
            
            let attendance = await Attendance.findOne({
                studentId: record.studentId,
                date: attendanceDate
            });
            
            if (attendance) {
                // Update existing record
                attendance.status = normalizedStatus;
                attendance.remarks = record.remarks || '';
                attendance.markedBy = req.user._id;
                attendance.trainerId = req.user._id;        // ✅ TRACKING
                attendance.trainerName = req.user.name;     // ✅ TRACKING
                attendance.updatedAt = new Date();
                await attendance.save();
                savedRecords.push(attendance);
                console.log(`✅ Updated attendance for student ${record.studentId}`);
            } else {
                // Create new record
                attendance = await Attendance.create({
                    studentId: record.studentId,
                    batchId: record.batchId,
                    date: attendanceDate,
                    status: normalizedStatus,
                    remarks: record.remarks || '',
                    markedBy: req.user._id,
                    trainerId: req.user._id,        // ✅ TRACKING - who marked attendance
                    trainerName: req.user.name      // ✅ TRACKING - trainer name
                });
                savedRecords.push(attendance);
                console.log(`✅ Created attendance for student ${record.studentId}`);
            }
        }
        
        console.log(`🎉 Attendance saved for ${savedRecords.length} students by ${req.user.name}`);
        
        res.json({
            success: true,
            data: savedRecords,
            message: `Attendance saved for ${savedRecords.length} students by ${req.user.name}`
        });
        
    } catch (error) {
        console.error('Error saving bulk attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== GET ATTENDANCE (WITH TRAINER FILTER) ====================
export const getAttendance = async (req, res) => {
    try {
        const { batchId, date, studentId } = req.query;
        
        let query = {};
        if (batchId) query.batchId = batchId;
        if (studentId) query.studentId = studentId;
        
        // ✅ Trainer can only see attendance of their own batches
        if (req.user.role === 'trainer') {
            const trainerBatches = await Batch.find({ trainerId: req.user._id }).select('_id');
            const batchIds = trainerBatches.map(b => b._id);
            query.batchId = { $in: batchIds };
        }
        
        if (date) {
            const searchDate = new Date(date);
            searchDate.setHours(0, 0, 0, 0);
            query.date = searchDate;
        }
        
        const attendance = await Attendance.find(query)
            .populate('studentId', 'name email enrollmentId photo')
            .populate('batchId', 'name code')
            .populate('markedBy', 'name')
            .populate('trainerId', 'name email')  // ✅ Populate trainer info
            .sort({ date: -1 });
        
        res.json({ success: true, data: attendance });
        
    } catch (error) {
        console.error('Error getting attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== GET ATTENDANCE BY TRAINER (TRACKING REPORT) ====================
export const getAttendanceByTrainer = async (req, res) => {
    try {
        const { trainerId, startDate, endDate } = req.query;
        const targetTrainerId = trainerId || req.user._id;
        
        let query = { trainerId: targetTrainerId };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const attendance = await Attendance.find(query)
            .populate('studentId', 'name email enrollmentId')
            .populate('batchId', 'name code course')
            .populate('trainerId', 'name email')
            .sort({ date: -1 });
        
        // Calculate stats
        const stats = {
            totalRecords: attendance.length,
            present: attendance.filter(a => a.status === 'Present').length,
            absent: attendance.filter(a => a.status === 'Absent').length,
            leave: attendance.filter(a => a.status === 'Leave').length,
            late: attendance.filter(a => a.status === 'Late').length,
            uniqueStudents: new Set(attendance.map(a => a.studentId?._id?.toString())).size,
            uniqueBatches: new Set(attendance.map(a => a.batchId?._id?.toString())).size
        };
        
        res.json({ 
            success: true, 
            data: attendance,
            stats,
            trainer: { id: req.user._id, name: req.user.name }
        });
        
    } catch (error) {
        console.error('Error getting attendance by trainer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== GET MONTHLY REPORT (WITH TRACKING) ====================
export const getMonthlyReport = async (req, res) => {
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
        
        // ✅ Check if trainer has access to this batch
        if (req.user.role === 'trainer' && batch.trainerId?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only view your own batches.' 
            });
        }
        
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
        
        const uniqueDates = new Set();
        currentMonthAttendance.forEach(record => {
            const date = new Date(record.date);
            uniqueDates.add(date.toDateString());
        });
        const totalWorkingDays = uniqueDates.size || 1;
        
        const studentStats = students.map(student => {
            const studentAttendance = currentMonthAttendance.filter(record => 
                record.studentId.toString() === student._id.toString()
            );
            
            const present = studentAttendance.filter(r => 
                r.status === 'Present' || r.status === 'present'
            ).length;
            const absent = studentAttendance.filter(r => 
                r.status === 'Absent' || r.status === 'absent'
            ).length;
            const leave = studentAttendance.filter(r => 
                r.status === 'Leave' || r.status === 'leave'
            ).length;
            const late = studentAttendance.filter(r => 
                r.status === 'Late' || r.status === 'late'
            ).length;
            
            const total = present + absent + leave + late;
            const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
            
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
            students: studentStats,
            markedBy: req.user.name  // ✅ TRACKING - who generated report
        }];
        
        res.json({ success: true, data: result });
        
    } catch (error) {
        console.error('Error in monthly report:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// ==================== UPDATE ATTENDANCE ====================
export const updateAttendance = async (req, res) => {
    try {
        const normalizedStatus = req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1).toLowerCase();
        
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            {
                status: normalizedStatus,
                remarks: req.body.remarks,
                markedBy: req.user._id,
                trainerId: req.user._id,        // ✅ TRACKING
                trainerName: req.user.name,     // ✅ TRACKING
                updatedAt: new Date()
            },
            { new: true }
        );
        
        if (!attendance) {
            return res.status(404).json({ 
                success: false, 
                message: 'Attendance not found' 
            });
        }
        
        res.json({ 
            success: true, 
            data: attendance,
            message: `Attendance updated by ${req.user.name}`
        });
        
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== DELETE ATTENDANCE ====================
export const deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);
        
        if (!attendance) {
            return res.status(404).json({ 
                success: false, 
                message: 'Attendance not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Attendance deleted successfully' 
        });
        
    } catch (error) {
        console.error('Error deleting attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};