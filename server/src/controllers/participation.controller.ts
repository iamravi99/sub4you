import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { Campaign } from '../models/Campaign.js';
import { CampaignParticipation } from '../models/CampaignParticipation.js';
import { VerificationService } from '../services/verification.service.js';
import { PARTICIPATION_STATUS, CAMPAIGN_STATUS } from '../constants/index.js';

export class ParticipationController {
  /**
   * Start participation in a campaign (records intent/session)
   */
  static async participateCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { campaignId } = req.body;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_CAMPAIGN_ID', message: 'Campaign ID is required' },
        });
        return;
      }

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        res.status(404).json({
          success: false,
          error: { code: 'CAMPAIGN_NOT_FOUND', message: 'Campaign not found' },
        });
        return;
      }

      if (campaign.status !== CAMPAIGN_STATUS.ACTIVE) {
        res.status(400).json({
          success: false,
          error: { code: 'CAMPAIGN_INACTIVE', message: 'Campaign is not currently active' },
        });
        return;
      }

      if (campaign.creatorId.toString() === user._id.toString()) {
        res.status(400).json({
          success: false,
          error: { code: 'SELF_PARTICIPATION', message: 'You cannot participate in your own campaign.' },
        });
        return;
      }

      const existing = await CampaignParticipation.findOne({
        campaignId: campaign._id,
        userId: user._id,
      });

      if (existing && existing.status === PARTICIPATION_STATUS.VERIFIED) {
        res.status(400).json({
          success: false,
          error: { code: 'ALREADY_VERIFIED', message: 'You have already completed this campaign action.' },
        });
        return;
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';

      if (!existing) {
        const participation = await CampaignParticipation.create({
          campaignId: campaign._id,
          userId: user._id,
          creatorId: campaign.creatorId,
          actionType: campaign.type,
          rewardAmount: campaign.costPerAction,
          status: PARTICIPATION_STATUS.PENDING,
          ipAddress: clientIp.split(',')[0].trim(),
          userAgent,
        });

        res.status(200).json({
          success: true,
          data: { participation, campaign },
          message: 'Participation session started. Please perform the action on YouTube and return to verify.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { participation: existing, campaign },
        message: 'Resuming participation session.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'PARTICIPATION_START_FAILED', message: error.message },
      });
    }
  }

  /**
   * Submit verification of completed YouTube action
   */
  static async verifyAction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { campaignId, actionTimeSeconds, youtubeAccount } = req.body;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_CAMPAIGN_ID', message: 'Campaign ID is required' },
        });
        return;
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';

      const result = await VerificationService.processVerification({
        campaignId,
        userId: user._id.toString(),
        ipAddress: clientIp.split(',')[0].trim(),
        userAgent,
        actionTimeSeconds: typeof actionTimeSeconds === 'number' ? actionTimeSeconds : 30,
        youtubeAccount,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      console.error('[Verification Error]', error);
      res.status(400).json({
        success: false,
        error: { code: 'VERIFICATION_ERROR', message: error.message || 'Action verification failed' },
      });
    }
  }
}
