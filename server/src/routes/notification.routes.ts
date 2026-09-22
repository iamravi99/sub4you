import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, NotificationController.getNotifications);
router.patch('/:id/read', authMiddleware, NotificationController.markAsRead);
router.patch('/read-all', authMiddleware, NotificationController.markAllAsRead);

export default router;
