import Assignment from '../models/Assignment.js';
import { deleteFromCloudinary } from '../middleware/uploadMiddleware.js';

// @desc    Create assignment (with tracking)
// @route   POST /api/assignments
export const createAssignment = async (req, res) => {
    try {
        const { title, description, course, batchId, dueDate, totalMarks } = req.body;

        console.log('=========================================');
        console.log('📝 Creating Assignment by:', req.user.name);
        console.log('👨‍🏫 Trainer ID:', req.user._id);
        console.log('📋 Title:', title);
        console.log('=========================================');

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

        // ✅ Create assignment with tracking fields
        const assignment = await Assignment.create({
            title,
            description: description || '',
            course,
            batchId,
            dueDate: new Date(dueDate),
            totalMarks: totalMarks || 100,
            attachments,
            createdBy: req.user._id,
            createdByName: req.user.name,     // ✅ Who created
            trainerId: req.user._id,           // ✅ Which trainer
            trainerName: req.user.name         // ✅ Trainer name
        });

        console.log('✅ Assignment created by:', req.user.name);
        console.log('📌 Assignment ID:', assignment._id);

        res.status(201).json({
            success: true,
            data: assignment,
            message: `Assignment "${title}" created by ${req.user.name}`
        });

    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all assignments (with tracking info)
// @route   GET /api/assignments
export const getAssignments = async (req, res) => {
    try {
        const { batchId, status } = req.query;
        
        let query = {};
        if (batchId) query.batchId = batchId;
        if (status) query.status = status;
        
        // If trainer, show only their batches
        if (req.user.role === 'trainer') {
            const Batch = await import('../models/Batch.js').then(m => m.default);
            const trainerBatches = await Batch.find({ trainerId: req.user._id });
            const batchIds = trainerBatches.map(b => b._id);
            query.batchId = { $in: batchIds };
            if (batchId) query.batchId = batchId;
        }
        
        const assignments = await Assignment.find(query)
            .populate('batchId', 'name code')
            .populate('createdBy', 'name')
            .populate('trainerId', 'name')
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
                averageScore: avgScore,
                createdByName: assignment.createdByName,
                trainerName: assignment.trainerName
            };
        });
        
        res.json({ 
            success: true, 
            data: assignmentsWithStats,
            message: `Found ${assignments.length} assignments`
        });
        
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
            .populate('trainerId', 'name')
            .populate('submissions.studentId', 'name email enrollmentId')
            .populate('submissions.gradedBy', 'name');
        
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
            message: `Assignment updated by ${req.user.name}`
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
        
        for (const attachment of assignment.attachments) {
            if (attachment.publicId) {
                await deleteFromCloudinary(attachment.publicId);
            }
        }
        
        for (const submission of assignment.submissions) {
            if (submission.filePublicId) {
                await deleteFromCloudinary(submission.filePublicId);
            }
        }
        
        await assignment.deleteOne();
        
        res.json({ 
            success: true, 
            message: `Assignment "${assignment.title}" deleted by ${req.user.name}` 
        });
        
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit assignment (with student tracking)
// @route   POST /api/assignments/submit
export const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, studentId, studentName } = req.body;
        
        console.log('=========================================');
        console.log('📤 Assignment Submission');
        console.log('👨‍🎓 Student:', studentName);
        console.log('📋 Assignment ID:', assignmentId);
        console.log('=========================================');
        
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
        
        // ✅ Track submission with student name
        const submissionData = {
            studentId,
            studentName: studentName || 'Unknown Student',
            submittedAt: new Date(),
            fileName: req.file?.originalname || '',
            fileUrl: req.file?.path || '',
            filePublicId: req.file?.filename || ''
        };
        
        assignment.submissions.push(submissionData);
        await assignment.save();
        
        console.log(`✅ Assignment submitted by ${studentName}`);
        
        res.json({
            success: true,
            message: `Assignment submitted by ${studentName}`,
            data: assignment
        });
        
    } catch (error) {
        console.error('Submit assignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Grade assignment (with grader tracking)
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
        
        console.log('=========================================');
        console.log('📝 Grading Assignment');
        console.log('👨‍🏫 Graded by:', req.user.name);
        console.log('👨‍🎓 Student:', submission.studentName);
        console.log('📊 Marks:', marks);
        console.log('=========================================');
        
        // ✅ Track grading information
        submission.marks = marks;
        submission.feedback = feedback || '';
        submission.graded = true;
        submission.gradedBy = req.user._id;
        submission.gradedByName = req.user.name;
        submission.gradedAt = new Date();
        
        await assignment.save();
        
        res.json({
            success: true,
            message: `Grade submitted by ${req.user.name} for ${submission.studentName}`,
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
        }).populate('batchId', 'name code')
          .populate('trainerId', 'name');
        
        res.json({ success: true, data: assignments });
        
    } catch (error) {
        console.error('Get student assignments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};