import express from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getLeadsByCounselor,
  getLeadsByCounselorForDashboard  // ✅ Import this
} from '../controllers/leadController.js';
import { protect, counselorOnly, adminManagerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// ✅ Dashboard route for counselor (must be before /:id)
router.get('/counselor/:counselorId', counselorOnly, getLeadsByCounselorForDashboard);

router.get('/', (req, res, next) => {
  if (req.user.role === 'admin_manager' || req.user.role === 'super_admin') {
    return getLeads(req, res, next);
  }
  if (req.user.role === 'counselor') {
    req.params.counselorId = req.user._id;
    return getLeadsByCounselorForDashboard(req, res, next);
  }
  next();
});

router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', adminManagerOnly, deleteLead);

export default router;