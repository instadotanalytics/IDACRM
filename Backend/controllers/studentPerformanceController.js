import mongoose from 'mongoose';
import StudentPerformance from '../models/StudentPerformance.js';
import Batch from '../models/Batch.js';
import Admission from '../models/Admission.js';

// @desc    Get all performances for a batch
// @route   GET /api/student-performance/batch/:batchId
export const getBatchPerformance = async (req, res) => {
    try {
        const { batchId } = req.params;
        
        console.log('Fetching performance for batch:', batchId);
        
        // Validate batchId
        if (!mongoose.Types.ObjectId.isValid(batchId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid batch ID'
            });
        }
        
        // Check if batch exists
        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }
        
        // Get students in this batch from Admission model
        let students = [];
        try {
            students = await Admission.find({ 
                batchId: batchId,
                status: 'active'
            }).select('_id name email enrollmentId photo');
        } catch (err) {
            console.log('Error fetching students:', err.message);
        }
        
        console.log('Students found:', students.length);
        
        // If no students, return empty data
        if (students.length === 0) {
            return res.json({
                success: true,
                data: {
                    students: [],
                    statistics: {
                        totalStudents: 0,
                        averagePercentage: 0,
                        totalPassed: 0,
                        totalFailed: 0,
                        passPercentage: 0,
                        gradeDistribution: {
                            'A+': 0, 'A': 0, 'B+': 0, 'B': 0,
                            'C+': 0, 'C': 0, 'D': 0, 'F': 0
                        }
                    }
                }
            });
        }
        
        // Get or create performance records
        const performances = [];
        let totalPercentage = 0;
        let passed = 0;
        let failed = 0;
        const gradeDistribution = {
            'A+': 0, 'A': 0, 'B+': 0, 'B': 0,
            'C+': 0, 'C': 0, 'D': 0, 'F': 0
        };
        
        for (const student of students) {
            let performance = await StudentPerformance.findOne({ 
                studentId: student._id, 
                batchId: batchId 
            });
            
            if (!performance) {
                // Create default performance record without using pre-save middleware issues
                performance = new StudentPerformance({
                    studentId: student._id,
                    batchId: batchId,
                    overallAttendance: 0,
                    averageAssignmentScore: 0,
                    averageTestScore: 0,
                    overallPercentage: 0,
                    overallGrade: 'F'
                });
                await performance.save();
                console.log('Created performance for student:', student.name);
            }
            
            performances.push({
                _id: performance._id,
                studentId: {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    enrollmentId: student.enrollmentId,
                    photo: student.photo
                },
                overallAttendance: performance.overallAttendance || 0,
                averageAssignmentScore: performance.averageAssignmentScore || 0,
                averageTestScore: performance.averageTestScore || 0,
                overallPercentage: performance.overallPercentage || 0,
                overallGrade: performance.overallGrade || 'F',
                totalAssignments: performance.totalAssignments || 0,
                submittedAssignments: performance.submittedAssignments || 0,
                totalTests: performance.totalTests || 0,
                totalPresent: performance.totalPresent || 0,
                totalAbsent: performance.totalAbsent || 0,
                totalLeave: performance.totalLeave || 0,
                totalLate: performance.totalLate || 0,
                highestTestScore: performance.highestTestScore || 0,
                lowestTestScore: performance.lowestTestScore || 0,
                remarks: performance.remarks || ''
            });
            
            totalPercentage += (performance.overallPercentage || 0);
            
            if ((performance.overallPercentage || 0) >= 45) {
                passed++;
            } else {
                failed++;
            }
            
            const grade = performance.overallGrade || 'F';
            gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        }
        
        const statistics = {
            totalStudents: students.length,
            averagePercentage: students.length > 0 ? totalPercentage / students.length : 0,
            totalPassed: passed,
            totalFailed: failed,
            passPercentage: students.length > 0 ? (passed / students.length) * 100 : 0,
            gradeDistribution: gradeDistribution
        };
        
        res.json({
            success: true,
            data: {
                students: performances,
                statistics: statistics
            }
        });
        
    } catch (error) {
        console.error('getBatchPerformance error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Calculate/update performance
// @route   POST /api/student-performance/calculate/:studentId
export const calculatePerformance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { batchId, attendanceData, assignmentData, testData } = req.body;
        
        if (!batchId) {
            return res.status(400).json({
                success: false,
                message: 'batchId is required'
            });
        }
        
        let performance = await StudentPerformance.findOne({ studentId, batchId });
        
        if (!performance) {
            performance = new StudentPerformance({
                studentId,
                batchId,
                overallAttendance: 0,
                averageAssignmentScore: 0,
                averageTestScore: 0
            });
        }
        
        // Update attendance
        if (attendanceData) {
            performance.overallAttendance = attendanceData.overallAttendance || 0;
            performance.totalPresent = attendanceData.totalPresent || 0;
            performance.totalAbsent = attendanceData.totalAbsent || 0;
            performance.totalLeave = attendanceData.totalLeave || 0;
            performance.totalLate = attendanceData.totalLate || 0;
        }
        
        // Update assignments
        if (assignmentData) {
            performance.totalAssignments = assignmentData.totalAssignments || 0;
            performance.submittedAssignments = assignmentData.submittedAssignments || 0;
            performance.averageAssignmentScore = assignmentData.averageScore || 0;
        }
        
        // Update tests
        if (testData) {
            performance.totalTests = testData.totalTests || 0;
            performance.averageTestScore = testData.averageScore || 0;
            performance.highestTestScore = testData.highestScore || 0;
            performance.lowestTestScore = testData.lowestScore || 0;
        }
        
        // Manually calculate percentage and grade
        performance.overallPercentage = 
            (performance.overallAttendance * 0.2) + 
            (performance.averageAssignmentScore * 0.3) + 
            (performance.averageTestScore * 0.5);
        
        if (performance.overallPercentage >= 90) performance.overallGrade = 'A+';
        else if (performance.overallPercentage >= 80) performance.overallGrade = 'A';
        else if (performance.overallPercentage >= 70) performance.overallGrade = 'B+';
        else if (performance.overallPercentage >= 60) performance.overallGrade = 'B';
        else if (performance.overallPercentage >= 50) performance.overallGrade = 'C+';
        else if (performance.overallPercentage >= 45) performance.overallGrade = 'C';
        else if (performance.overallPercentage >= 35) performance.overallGrade = 'D';
        else performance.overallGrade = 'F';
        
        await performance.save();
        
        res.json({
            success: true,
            data: performance,
            message: 'Performance calculated successfully'
        });
        
    } catch (error) {
        console.error('calculatePerformance error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};