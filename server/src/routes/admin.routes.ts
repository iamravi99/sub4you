import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = Router();

// Protect all admin routes with authentication + admin role check
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

// Dashboard stats
router.get('/dashboard', AdminController.getDashboardStats);

// User management
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.post('/users/:id/adjust-coins', AdminController.adjustUserCoins);

// Campaign management
router.get('/campaigns', AdminController.getCampaigns);
router.patch('/campaigns/:id/moderate', AdminController.moderateCampaign);

// Coin Purchase Requests
router.get('/coin-requests', AdminController.getCoinRequests);
router.post('/coin-requests/:id/approve', AdminController.approveCoinRequest);
router.post('/coin-requests/:id/reject', AdminController.rejectCoinRequest);

// Verification Queue
router.get('/verification-queue', AdminController.getVerificationQueue);
router.post('/verifications/:id/approve', AdminController.approveVerification);
router.post('/verifications/:id/reject', AdminController.rejectVerification);

// Audit Logs
router.get('/audit-logs', AdminController.getAuditLogs);

// System Settings
router.get('/settings', AdminController.getSettings);
router.patch('/settings', AdminController.updateSettings);

export default router;
