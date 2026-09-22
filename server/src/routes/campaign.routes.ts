import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller.js';
import { ParticipationController } from '../controllers/participation.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { strictRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public discovery (supports optional user auth context)
router.get('/', (req, res, next) => {
  // If authorization header present, run through authMiddleware, else proceed
  if (req.headers.authorization) {
    return authMiddleware(req as any, res, next);
  }
  next();
}, CampaignController.getDiscoverCampaigns);

router.post('/validate-url', authMiddleware, CampaignController.validateYoutubeUrl);
router.post('/', authMiddleware, strictRateLimiter, CampaignController.createCampaign);
router.get('/my', authMiddleware, CampaignController.getMyCampaigns);
router.get('/:id', (req, res, next) => {
  if (req.headers.authorization) {
    return authMiddleware(req as any, res, next);
  }
  next();
}, CampaignController.getCampaignById);
router.patch('/:id/status', authMiddleware, CampaignController.updateCampaignStatus);

// Participation & Verification
router.post('/:id/participate', authMiddleware, ParticipationController.participateCampaign);
router.post('/:id/verify', authMiddleware, strictRateLimiter, ParticipationController.verifyAction);

export default router;
