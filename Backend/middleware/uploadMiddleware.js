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

export default upload;