import CourseMaterial from '../models/CourseMaterial.js';
import { deleteFromCloudinary } from '../middleware/uploadMiddleware.js';

// @desc    Create course material
// @route   POST /api/course-materials
export const createMaterial = async (req, res) => {
    try {
        const { title, description, type, course, batchId, topic, externalLink, duration } = req.body;

        console.log('📝 Creating course material:', { title, type, course, batchId });

        if (!title || !type || !course || !batchId) {
            return res.status(400).json({
                success: false,
                message: 'Title, type, course, and batchId are required'
            });
        }

        let fileUrl = '';
        let filePublicId = '';
        let fileName = '';
        let fileSize = '';

        if (req.file) {
            fileUrl = req.file.path;
            filePublicId = req.file.filename;
            fileName = req.file.originalname;
            fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
        }

        const material = await CourseMaterial.create({
            title,
            description: description || '',
            type,
            course,
            batchId,
            topic: topic || '',
            fileUrl,
            filePublicId,
            fileName,
            externalLink: externalLink || '',
            duration: duration || '',
            size: fileSize,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: material,
            message: 'Course material added successfully'
        });

    } catch (error) {
        console.error('Create material error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all course materials
// @route   GET /api/course-materials
export const getMaterials = async (req, res) => {
    try {
        const { batchId, type, course } = req.query;
        
        let query = {};
        if (batchId) query.batchId = batchId;
        if (type) query.type = type;
        if (course) query.course = course;
        
        const materials = await CourseMaterial.find(query)
            .populate('batchId', 'name code')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, data: materials });
        
    } catch (error) {
        console.error('Get materials error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single material
// @route   GET /api/course-materials/:id
export const getMaterialById = async (req, res) => {
    try {
        const material = await CourseMaterial.findById(req.params.id)
            .populate('batchId', 'name code')
            .populate('createdBy', 'name');
        
        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found' });
        }
        
        res.json({ success: true, data: material });
        
    } catch (error) {
        console.error('Get material error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update course material
// @route   PUT /api/course-materials/:id
export const updateMaterial = async (req, res) => {
    try {
        let material = await CourseMaterial.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found' });
        }
        
        const updateData = { ...req.body };
        
        if (req.file) {
            if (material.filePublicId) {
                await deleteFromCloudinary(material.filePublicId);
            }
            updateData.fileUrl = req.file.path;
            updateData.filePublicId = req.file.filename;
            updateData.fileName = req.file.originalname;
            updateData.size = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
        }
        
        material = await CourseMaterial.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        res.json({
            success: true,
            data: material,
            message: 'Material updated successfully'
        });
        
    } catch (error) {
        console.error('Update material error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete course material
// @route   DELETE /api/course-materials/:id
export const deleteMaterial = async (req, res) => {
    try {
        const material = await CourseMaterial.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found' });
        }
        
        if (material.filePublicId) {
            await deleteFromCloudinary(material.filePublicId);
        }
        
        await material.deleteOne();
        
        res.json({ success: true, message: 'Material deleted successfully' });
        
    } catch (error) {
        console.error('Delete material error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get materials by batch for trainer
// @route   GET /api/course-materials/batch/:batchId
export const getMaterialsByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        
        const materials = await CourseMaterial.find({ batchId })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        
        // Group by type
        const grouped = {
            videos: materials.filter(m => m.type === 'video'),
            pdfs: materials.filter(m => m.type === 'pdf'),
            documents: materials.filter(m => m.type === 'document'),
            presentations: materials.filter(m => m.type === 'presentation'),
            links: materials.filter(m => m.type === 'link'),
            assignments: materials.filter(m => m.type === 'assignment')
        };
        
        res.json({ success: true, data: { all: materials, grouped } });
        
    } catch (error) {
        console.error('Get materials by batch error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};