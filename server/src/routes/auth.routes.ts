import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/sync', authMiddleware, AuthController.syncUser);
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
