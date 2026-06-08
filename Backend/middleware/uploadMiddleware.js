import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config directly here
cloudinary.config({
    cloud_name:  'dnzg3rxax',
    api_key:     '797569798274868',
    api_secret:  'Qlpd6xu7E33HGmgOSL-p9jMme1A'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder:         'admissions',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 300, height: 300, crop: 'fill' }]
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, WEBP images are allowed'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

export const deleteFromCloudinary = async (publicId) => {
    try {
        if (publicId) {
            const result = await cloudinary.uploader.destroy(publicId);
            console.log('Cloudinary delete:', result);
            return result;
        }
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return null;
    }
};

// ✅ ADD THIS - Named export for single file upload
export const uploadPhoto = upload.single('photo');

// ✅ ADD THIS - Export the cloudinary instance if needed elsewhere
export { cloudinary };

// Add this configuration for assignments
const assignmentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'IDACRM/assignments',
        allowed_formats: ['pdf', 'doc', 'docx', 'zip', 'txt', 'jpg', 'jpeg', 'png'],
        resource_type: 'auto'
    }
});

const assignmentUpload = multer({
    storage: assignmentStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, ZIP, TXT, and image files are allowed'), false);
        }
    }
});

export const uploadAssignment = assignmentUpload;



// PDF upload for tests
const testPDFStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'IDACRM/tests',
        allowed_formats: ['pdf'],
        resource_type: 'auto'
    }
});

export const uploadTestPDF = multer({
    storage: testPDFStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Add this to your existing uploadMiddleware.js

// Course material upload
const materialStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'IDACRM/materials',
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'mp4', 'mov'],
        resource_type: 'auto'
    }
});

export const uploadMaterial = multer({
    storage: materialStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});




// ✅ Default export
export default upload;