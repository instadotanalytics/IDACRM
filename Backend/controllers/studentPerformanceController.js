import StudentPerformance from '../models/StudentPerformance.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import Test from '../models/Test.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import Admission from '../models/Admission.js';

// @desc    Calculate and update student performance
// @route   POST /api/student-performance/calculate/:studentId
export const calculatePerformance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { batchId } = req.body;

        // Get attendance records
        const attendanceRecords = await Attendance.find({ studentId });
        const totalDays = attendanceRecords.length;
        const present = attendanceRecords.filter(a => a.status === 'Present').length;
        const absent = attendanceRecords.filter(a => a.status === 'Absent').length;
        const leave = attendanceRecords.filter(a => a.status === 'Leave').length;
        const late = attendanceRecords.filter(a => a.status === 'Late').length;
        const attendancePercentage = totalDays > 0 ? (present / totalDays) * 100 : 0;

        // Get assignments
        const assignments = await Assignment.find({ 'submissions.studentId': studentId });
        let totalAssignmentMarks = 0;
        let assignmentCount = 0;
        assignments.forEach(assignment => {
            const submission = assignment.submissions.find(s => s.studentId.toString() === studentId);
            if (submission && submission.marks) {
                totalAssignmentMarks += (submission.marks / assignment.totalMarks) * 100;
                assignmentCount++;
            }
        });
        const avgAssignmentScore = assignmentCount > 0 ? totalAssignmentMarks / assignmentCount : 0;

        // Get tests
        const tests = await Test.find({ 'results.studentId': studentId });
        let totalTestScore = 0;
        let testCount = 0;
        let highestScore = 0;
        let lowestScore = 100;
        tests.forEach(test => {
            const result = test.results.find(r => r.studentId.toString() === studentId);
            if (result && result.percentage) {
                totalTestScore += result.percentage;
                testCount++;
                if (result.percentage > highestScore) highestScore = result.percentage;
                if (result.percentage < lowestScore) lowestScore = result.percentage;
            }
        });
        const avgTestScore = testCount > 0 ? totalTestScore / testCount : 0;

        // Calculate overall percentage
        const overallPercentage = (attendancePercentage * 0.3 + avgAssignmentScore * 0.35 + avgTestScore * 0.35);
        
        // Determine grade
        let overallGrade = 'F';
        if (overallPercentage >= 90) overallGrade = 'A+';
        else if (overallPercentage >= 80) overallGrade = 'A';
        else if (overallPercentage >= 75) overallGrade = 'B+';
        else if (overallPercentage >= 70) overallGrade = 'B';
        else if (overallPercentage >= 65) overallGrade = 'C+';
        else if (overallPercentage >= 60) overallGrade = 'C';
        else if (overallPercentage >= 50) overallGrade = 'D';
        else overallGrade = 'F';

        // Update or create performance record
        let performance = await StudentPerformance.findOne({ studentId, batchId });
        
        if (performance) {
            performance.overallAttendance = attendancePercentage;
            performance.totalPresent = present;
            performance.totalAbsent = absent;
            performance.totalLeave = leave;
            performance.totalLate = late;
            performance.totalAssignments = assignmentCount;
            performance.submittedAssignments = assignmentCount;
            performance.averageAssignmentScore = avgAssignmentScore;
            performance.totalTests = testCount;
            performance.averageTestScore = avgTestScore;
            performance.highestTestScore = highestScore;
            performance.lowestTestScore = lowestScore;
            performance.overallGrade = overallGrade;
            performance.overallPercentage = overallPercentage;
            performance.lastUpdated = new Date();
            await performance.save();
        } else {
            performance = await StudentPerformance.create({
                studentId,
                batchId,
                overallAttendance: attendancePercentage,
                totalPresent: present,
                totalAbsent: absent,
                totalLeave: leave,
                totalLate: late,
                totalAssignments: assignmentCount,
                submittedAssignments: assignmentCount,
                averageAssignmentScore: avgAssignmentScore,
                totalTests: testCount,
                averageTestScore: avgTestScore,
                highestTestScore: highestScore,
                lowestTestScore: lowestScore,
                overallGrade: overallGrade,
                overallPercentage: overallPercentage
            });
        }

        res.json({
            success: true,
            data: performance,
            message: 'Performance calculated successfully'
        });

    } catch (error) {
        console.error('Calculate performance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student performance
// @route   GET /api/student-performance/:studentId
export const getStudentPerformance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { batchId } = req.query;

        let query = { studentId };
        if (batchId) query.batchId = batchId;

        let performance = await StudentPerformance.findOne(query)
            .populate('studentId', 'name email enrollmentId photo course')
            .populate('batchId', 'name code course');

        if (!performance) {
            // Calculate if not exists
            const calculateRes = await fetch(`${process.env.BACKEND_URL}/api/student-performance/calculate/${studentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ batchId })
            });
            const data = await calculateRes.json();
            performance = data.data;
        }

        res.json({ success: true, data: performance });

    } catch (error) {
        console.error('Get student performance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get batch performance (all students)
// @route   GET /api/student-performance/batch/:batchId
export const getBatchPerformance = async (req, res) => {
    try {
        const { batchId } = req.params;

        // Get all students in batch
        const students = await Admission.find({ batchId });
        
        // Get performance for all students
        const performances = await StudentPerformance.find({ batchId })
            .populate('studentId', 'name email enrollmentId photo');

        // Merge with students who don't have performance record
        const allPerformances = students.map(student => {
            const existing = performances.find(p => p.studentId._id.toString() === student._id.toString());
            if (existing) return existing;
            return {
                studentId: student,
                overallPercentage: 0,
                overallGrade: 'F',
                overallAttendance: 0,
                averageAssignmentScore: 0,
                averageTestScore: 0
            };
        });

        // Calculate batch statistics
        const totalStudents = allPerformances.length;
        const avgBatchPercentage = allPerformances.reduce((sum, p) => sum + (p.overallPercentage || 0), 0) / totalStudents;
        const gradeDistribution = {
            'A+': allPerformances.filter(p => p.overallGrade === 'A+').length,
            'A': allPerformances.filter(p => p.overallGrade === 'A').length,
            'B+': allPerformances.filter(p => p.overallGrade === 'B+').length,
            'B': allPerformances.filter(p => p.overallGrade === 'B').length,
            'C+': allPerformances.filter(p => p.overallGrade === 'C+').length,
            'C': allPerformances.filter(p => p.overallGrade === 'C').length,
            'D': allPerformances.filter(p => p.overallGrade === 'D').length,
            'F': allPerformances.filter(p => p.overallGrade === 'F').length
        };

        res.json({
            success: true,
            data: {
                students: allPerformances,
                statistics: {
                    totalStudents,
                    averagePercentage: avgBatchPercentage,
                    gradeDistribution,
                    topPerformer: allPerformances.sort((a, b) => b.overallPercentage - a.overallPercentage)[0],
                    lowPerformer: allPerformances.sort((a, b) => a.overallPercentage - b.overallPercentage)[0]
                }
            }
        });

    } catch (error) {
        console.error('Get batch performance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update student remarks
// @route   PUT /api/student-performance/:id/remarks
export const updateRemarks = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const performance = await StudentPerformance.findByIdAndUpdate(
            id,
            { remarks },
            { new: true }
        );

        if (!performance) {
            return res.status(404).json({ success: false, message: 'Performance record not found' });
        }

        res.json({ success: true, data: performance, message: 'Remarks updated successfully' });

    } catch (error) {
        console.error('Update remarks error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get performance summary for dashboard
// @route   GET /api/student-performance/summary/:batchId
export const getPerformanceSummary = async (req, res) => {
    try {
        const { batchId } = req.params;

        const performances = await StudentPerformance.find({ batchId })
            .populate('studentId', 'name');

        const totalStudents = performances.length;
        const averageAttendance = performances.reduce((sum, p) => sum + (p.overallAttendance || 0), 0) / totalStudents;
        const averageAssignment = performances.reduce((sum, p) => sum + (p.averageAssignmentScore || 0), 0) / totalStudents;
        const averageTest = performances.reduce((sum, p) => sum + (p.averageTestScore || 0), 0) / totalStudents;
        
        const totalPassed = performances.filter(p => p.overallGrade !== 'F').length;
        const totalFailed = performances.filter(p => p.overallGrade === 'F').length;

        res.json({
            success: true,
            data: {
                totalStudents,
                averageAttendance,
                averageAssignment,
                averageTest,
                totalPassed,
                totalFailed,
                passPercentage: totalStudents > 0 ? (totalPassed / totalStudents) * 100 : 0
            }
        });

    } catch (error) {
        console.error('Get performance summary error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};