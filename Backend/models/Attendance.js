import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admission',  // ✅ CHANGED: 'Student' → 'Admission'
        // Kyunki TrainerAttendanceMarker mein students /admissions se fetch hote hain
        // aur unhi ke _id attendance mein save hote hain
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave', 'Late'],
        default: 'Present'
    },
    clockIn: {
        type: String,
        default: ''
    },
    clockOut: {
        type: String,
        default: ''
    },
    workingHours: {
        type: String,
        default: ''
    },
    remarks: {
        type: String,
        default: ''
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Index for faster queries
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ batchId: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;