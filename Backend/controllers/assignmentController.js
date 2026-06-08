import Assignment from '../models/Assignment.js';
import { deleteFromCloudinary } from '../middleware/uploadMiddleware.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Create assignment
// @route   POST /api/assignments
export const createAssignment = async (req, res) => {
    try {
        const { title, description, course, batchId, dueDate, totalMarks } = req.body;

        if (!title || !course || !batchId || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'Title, course, batchId, and dueDate are required'
            });
        }

        let attachments = [];
        if (req.file) {
            attachments.push({
                name: req.file.originalname,
                url: req.file.path,
                publicId: req.file.filename
            });
        }

        const assignment = await Assignment.create({
            title,
            description: description || '',
            course,
            batchId,
            dueDate: new Date(dueDate),
            totalMarks: totalMarks || 100,
            attachments,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: assignment,
            message: 'Assignment created successfully'
        });

    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all assignments
// @route   GET /api/assignments
export const getAssignments = async (req, res) => {
    try {
        const { batchId, status } = req.query;
        
        let query = {};
        if (batchId) query.batchId = batchId;
        if (status) query.status = status;
        
        // If trainer, show only their batches
        if (req.user.role === 'trainer') {
            // Get batches assigned to this trainer
            const Batch = await import('../models/Batch.js').then(m => m.default);
            const trainerBatches = await Batch.find({ trainerId: req.user._id });
            const batchIds = trainerBatches.map(b => b._id);
            query.batchId = { $in: batchIds };
            if (batchId) query.batchId = batchId;
        }
        
        const assignments = await Assignment.find(query)
            .populate('batchId', 'name code')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        
        // Calculate submission stats for each assignment
        const assignmentsWithStats = assignments.map(assignment => {
            const totalSubmissions = assignment.submissions.length;
            const gradedSubmissions = assignment.submissions.filter(s => s.graded).length;
            const avgScore = assignment.submissions.length > 0 
                ? (assignment.submissions.reduce((sum, s) => sum + (s.marks || 0), 0) / assignment.submissions.length).toFixed(1)
                : 0;
            
            return {
                ...assignment.toObject(),
                totalSubmissions,
                gradedSubmissions,
                averageScore: avgScore
            };
        });
        
        res.json({ success: true, data: assignmentsWithStats });
        
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
export const getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('batchId', 'name code')
            .populate('createdBy', 'name')
            .populate('submissions.studentId', 'name email enrollmentId');
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        
        res.json({ success: true, data: assignment });
        
    } catch (error) {
        console.error('Get assignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
export const updateAssignment = async (req, res) => {
    try {
        let assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        
        const updateData = { ...req.body };
        if (req.body.dueDate) updateData.dueDate = new Date(req.body.dueDate);
        
        if (req.file) {
            // Delete old attachment if exists
            if (assignment.attachments.length > 0) {
                await deleteFromCloudinary(assignment.attachments[0].publicId);
            }
            updateData.attachments = [{
                name: req.file.originalname,
                url: req.file.path,
                publicId: req.file.filename
            }];
        }
        
        assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            data: assignment,
            message: 'Assignment updated successfully'
        });
        
    } catch (error) {
        console.error('Update assignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
export const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        
        // Delete attachments from cloudinary
        for (const attachment of assignment.attachments) {
            if (attachment.publicId) {
                await deleteFromCloudinary(attachment.publicId);
            }
        }
        
        // Delete all submission files
        for (const submission of assignment.submissions) {
            if (submission.filePublicId) {
                await deleteFromCloudinary(submission.filePublicId);
            }
        }
        
        await assignment.deleteOne();
        
        res.json({ success: true, message: 'Assignment deleted successfully' });
        
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit assignment (for students)
// @route   POST /api/assignments/submit
export const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, studentId } = req.body;
        
        if (!assignmentId || !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Assignment ID and Student ID are required'
            });
        }
        
        const assignment = await Assignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        
        // Check if already submitted
        const existingSubmission = assignment.submissions.find(
            s => s.studentId.toString() === studentId
        );
        
        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted this assignment'
            });
        }
        
        let submissionData = {
            studentId,
            submittedAt: new Date(),
            fileName: req.file?.originalname || '',
            fileUrl: req.file?.path || '',
            filePublicId: req.file?.filename || ''
        };
        
        assignment.submissions.push(submissionData);
        await assignment.save();
        
        res.json({
            success: true,
            message: 'Assignment submitted successfully',
            data: assignment
        });
        
    } catch (error) {
        console.error('Submit assignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Grade assignment
// @route   POST /api/assignments/:id/grade
export const gradeAssignment = async (req, res) => {
    try {
        const { studentId, marks, feedback } = req.body;
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        
        const submission = assignment.submissions.find(
            s => s.studentId.toString() === studentId
        );
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        
        submission.marks = marks;
        submission.feedback = feedback || '';
        submission.graded = true;
        
        await assignment.save();
        
        res.json({
            success: true,
            message: 'Grade submitted successfully',
            data: assignment
        });
        
    } catch (error) {
        console.error('Grade assignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student assignments
// @route   GET /api/assignments/student
export const getStudentAssignments = async (req, res) => {
    try {
        const { studentId } = req.query;
        
        const assignments = await Assignment.find({
            'submissions.studentId': studentId
        }).populate('batchId', 'name code');
        
        res.json({ success: true, data: assignments });
        
    } catch (error) {
        console.error('Get student assignments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};