import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', authMiddleware, UserController.getMyProfile);
router.patch('/me', authMiddleware, UserController.updateProfile);
router.get('/profile/:username', UserController.getPublicProfile);

export default router;
