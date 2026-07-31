// routes/callRoutes.js - UPDATED WITH SOCKET.IO
import express from 'express';
import {
  addCallLog,
  getTodayCalls,
  getWeeklyCalls,
  getAllCalls,
  updateCallLog,
  deleteCallLog,
  getCallsByCounselor,
  getCallsByCounselorForDashboard,
  getCounselorWiseCallStats
} from '../controllers/callLogController.js';
import { protect } from '../middleware/authMiddleware.js';

// Export as function to receive io instance
const router = (io) => {
  const router = express.Router();

  router.use(protect);

  // ✅ Admin report route
  router.get('/counselor-stats', getCounselorWiseCallStats);

  // ✅ Dashboard route for counselor
  router.get('/counselor/:counselorId', getCallsByCounselorForDashboard);

  // ✅ Main routes - Pass io to controllers
  router.post('/', (req, res) => addCallLog(req, res, io));
  router.get('/today', getTodayCalls);
  router.get('/weekly', getWeeklyCalls);
  router.get('/', getAllCalls);
  router.put('/:id', (req, res) => updateCallLog(req, res, io));
  router.delete('/:id', (req, res) => deleteCallLog(req, res, io));

  return router;
};

export default router;