import express from 'express';
import {
    getCompanies,
    getCompanyStats,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyActivities,
    getHRPerformance
} from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Company routes
router.get('/', getCompanies);
router.get('/stats', getCompanyStats);
router.get('/hr-performance', getHRPerformance);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);
router.get('/:id/activities', getCompanyActivities);

export default router;