import Test from '../models/Test.js';
import { parseQuestionsFromPDF } from '../utils/pdfParser.js';
import { deleteFromCloudinary } from '../middleware/uploadMiddleware.js';

// @desc    Create test
// @route   POST /api/tests
export const createTest = async (req, res) => {
    try {
        const { title, description, course, batchId, duration, startDate, endDate, questions } = req.body;

        console.log('📝 Creating test:', { title, course, batchId, duration });

        // Validation
        if (!title || !course || !batchId || !duration || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Title, course, batchId, duration, startDate, and endDate are required'
            });
        }

        let parsedQuestions = [];
        let pdfUrl = '';
        let pdfPublicId = '';

        // Check if PDF file uploaded
        if (req.file) {
            console.log('📄 PDF file uploaded:', req.file.originalname);
            pdfUrl = req.file.path;
            pdfPublicId = req.file.filename;
        }
        
        // Check if manual questions provided
        if (questions) {
            parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
            console.log(`✅ Using ${parsedQuestions.length} manual questions`);
        }

        // Create test (allow empty questions)
        const test = await Test.create({
            title,
            description: description || '',
            course,
            batchId,
            duration: parseInt(duration),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            questions: parsedQuestions,
            pdfUrl,
            pdfPublicId,
            createdBy: req.user._id
        });

        console.log(`✅ Test created successfully: ${test._id}`);

        res.status(201).json({
            success: true,
            data: test,
            message: `Test created successfully with ${parsedQuestions.length} questions`
        });

    } catch (error) {
        console.error('Create test error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all tests
// @route   GET /api/tests
export const getTests = async (req, res) => {
    try {
        const { batchId } = req.query;
        
        let query = {};
        if (batchId) query.batchId = batchId;
        
        const tests = await Test.find(query)
            .populate('batchId', 'name code')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        
        // Calculate stats for each test
        const now = new Date();
        const updatedTests = tests.map(test => {
            let status = 'upcoming';
            if (test.startDate > now) status = 'upcoming';
            else if (test.endDate < now) status = 'expired';
            else if (test.startDate <= now && test.endDate >= now) status = 'active';
            
            const totalStudents = test.results?.length || 0;
            const averageScore = test.results?.length > 0 
                ? (test.results.reduce((sum, r) => sum + (r.percentage || 0), 0) / test.results.length).toFixed(1)
                : 0;
            
            return {
                ...test.toObject(),
                status,
                totalStudents,
                averageScore: parseFloat(averageScore)
            };
        });
        
        res.json({ success: true, data: updatedTests });
        
    } catch (error) {
        console.error('Get tests error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single test
// @route   GET /api/tests/:id
export const getTestById = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)
            .populate('batchId', 'name code')
            .populate('createdBy', 'name')
            .populate('results.studentId', 'name email enrollmentId');
        
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }
        
        res.json({ success: true, data: test });
        
    } catch (error) {
        console.error('Get test error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update test
// @route   PUT /api/tests/:id
export const updateTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        const updateData = { ...req.body };
        
        if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
        if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
        
        if (req.file) {
            if (test.pdfPublicId) {
                await deleteFromCloudinary(test.pdfPublicId);
            }
            updateData.pdfUrl = req.file.path;
            updateData.pdfPublicId = req.file.filename;
        }
        
        if (req.body.questions) {
            updateData.questions = typeof req.body.questions === 'string' 
                ? JSON.parse(req.body.questions) 
                : req.body.questions;
        }
        
        const updatedTest = await Test.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        res.json({
            success: true,
            data: updatedTest,
            message: 'Test updated successfully'
        });
        
    } catch (error) {
        console.error('Update test error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete test
// @route   DELETE /api/tests/:id
export const deleteTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }
        
        if (test.pdfPublicId) {
            await deleteFromCloudinary(test.pdfPublicId);
        }
        
        await test.deleteOne();
        
        res.json({ success: true, message: 'Test deleted successfully' });
        
    } catch (error) {
        console.error('Delete test error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit test
// @route   POST /api/tests/:id/submit
export const submitTest = async (req, res) => {
    try {
        const { studentId, answers } = req.body;
        const test = await Test.findById(req.params.id);
        
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }
        
        // Check if already submitted
        const existingResult = test.results.find(r => r.studentId.toString() === studentId);
        if (existingResult && existingResult.status === 'submitted') {
            return res.status(400).json({ success: false, message: 'Already submitted' });
        }
        
        let totalScore = 0;
        const evaluatedAnswers = test.questions.map((question, idx) => {
            const userAnswer = answers && answers[idx] !== undefined ? answers[idx] : -1;
            const isCorrect = userAnswer === question.correctAnswer;
            const marksObtained = isCorrect ? question.marks : 0;
            totalScore += marksObtained;
            
            return {
                questionId: idx,
                selectedOption: userAnswer,
                isCorrect,
                marksObtained
            };
        });
        
        const percentage = test.totalMarks > 0 ? (totalScore / test.totalMarks) * 100 : 0;
        
        const result = {
            studentId,
            submittedAt: new Date(),
            answers: evaluatedAnswers,
            totalScore,
            percentage: parseFloat(percentage.toFixed(2)),
            status: 'submitted'
        };
        
        if (existingResult) {
            existingResult.submittedAt = result.submittedAt;
            existingResult.answers = result.answers;
            existingResult.totalScore = result.totalScore;
            existingResult.percentage = result.percentage;
            existingResult.status = 'submitted';
        } else {
            test.results.push(result);
        }
        
        await test.save();
        
        res.json({
            success: true,
            data: { score: totalScore, percentage: parseFloat(percentage.toFixed(2)), totalMarks: test.totalMarks },
            message: 'Test submitted successfully'
        });
        
    } catch (error) {
        console.error('Submit test error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get test results
// @route   GET /api/tests/:id/results
export const getTestResults = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)
            .populate('results.studentId', 'name email enrollmentId');
        
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }
        
        res.json({ success: true, data: test.results });
        
    } catch (error) {
        console.error('Get test results error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};