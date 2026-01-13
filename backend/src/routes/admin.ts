import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { 
  listPendingJobs, 
  approveJob, 
  revenueReport, 
  auditLogs, 
  gdprDeleteUser, 
  runCrawlers,
  getAdminStats,
  getJobAnalytics,
  getUserAnalytics,
  getRevenueAnalytics,
  getNotifications,
} from '../controllers/adminController';

const router = express.Router();

// Stats endpoints
router.get('/stats', authenticateToken, requireRole('admin'), getAdminStats);
router.get('/analytics/jobs', authenticateToken, requireRole('admin'), getJobAnalytics);
router.get('/analytics/users', authenticateToken, requireRole('admin'), getUserAnalytics);
router.get('/analytics/revenue', authenticateToken, requireRole('admin'), getRevenueAnalytics);
router.get('/notifications', authenticateToken, requireRole('admin'), getNotifications);

// Existing endpoints
router.get('/jobs/pending', authenticateToken, requireRole('admin'), listPendingJobs);
router.post('/jobs/:id/approve', authenticateToken, requireRole('admin'), approveJob);
router.get('/reports/revenue', authenticateToken, requireRole('admin'), revenueReport);
router.get('/audit', authenticateToken, requireRole('admin'), auditLogs);
router.delete('/gdpr/delete-user/:id', authenticateToken, requireRole('admin'), gdprDeleteUser);
router.post('/scrape/run', authenticateToken, requireRole('admin'), runCrawlers);

export default router;
