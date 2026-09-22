import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { Campaign } from '../models/Campaign.js';
import { CampaignParticipation } from '../models/CampaignParticipation.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { YouTubeService } from '../services/youtube.service.js';
import { CoinLedgerService } from '../services/coinLedger.service.js';
import { CAMPAIGN_STATUS, CAMPAIGN_TYPES } from '../constants/index.js';

export class CampaignController {
  /**
   * Validate YouTube video URL and extract metadata
   */
  static async validateYoutubeUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_URL', message: 'YouTube URL is required' },
        });
        return;
      }

      const metadata = await YouTubeService.getVideoMetadata(url);
      res.status(200).json({
        success: true,
        data: metadata,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'YOUTUBE_FETCH_ERROR', message: error.message || 'Failed to extract YouTube metadata' },
      });
    }
  }

  /**
   * Create and launch a new campaign with escrow reservation
   */
  static async createCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const {
        title,
        description,
        youtubeUrl,
        type,
        targetQuantity,
        category,
        language,
        targetAudience,
      } = req.body;

      if (!title || !youtubeUrl || !type || !targetQuantity) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'Title, YouTube URL, Campaign Type, and Target Quantity are required.' },
        });
        return;
      }

      if (!Object.values(CAMPAIGN_TYPES).includes(type)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_TYPE', message: 'Campaign type must be either SUBSCRIBER or LIKE.' },
        });
        return;
      }

      const qty = parseInt(targetQuantity, 10);
      if (isNaN(qty) || qty < 5) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_QUANTITY', message: 'Target quantity must be at least 5.' },
        });
        return;
      }

      // Check system settings for budget rules
      const settings = await SystemSetting.findOne();
      const minBudget = settings?.campaignMinBudget ?? 5;
      const maxBudget = settings?.campaignMaxBudget ?? 10000;
      const maxActive = settings?.maxActiveCampaignsPerUser ?? 10;

      const activeCount = await Campaign.countDocuments({ creatorId: user._id, status: CAMPAIGN_STATUS.ACTIVE });
      if (activeCount >= maxActive) {
        res.status(400).json({
          success: false,
          error: { code: 'CAMPAIGN_LIMIT_REACHED', message: `You have reached the limit of ${maxActive} active campaigns.` },
        });
        return;
      }

      const costPerAction = type === CAMPAIGN_TYPES.SUBSCRIBER
        ? (settings?.rewardRates?.subscriber ?? 1)
        : (settings?.rewardRates?.like ?? 1);

      const totalBudget = qty * costPerAction;

      if (totalBudget < minBudget || totalBudget > maxBudget) {
        res.status(400).json({
          success: false,
          error: { code: 'BUDGET_OUT_OF_BOUNDS', message: `Campaign budget must be between ${minBudget} and ${maxBudget} coins.` },
        });
        return;
      }

      if (user.coins < totalBudget) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_COINS',
            message: `You need ${totalBudget} coins to launch this campaign, but you currently have ${user.coins} available coins. Please purchase coins first.`,
          },
        });
        return;
      }

      // Extract YouTube info
      const videoMeta = await YouTubeService.getVideoMetadata(youtubeUrl);

      // Create Campaign document
      const campaign = new Campaign({
        creatorId: user._id,
        title: title.trim(),
        description: (description || '').trim(),
        youtubeUrl: youtubeUrl.trim(),
        youtubeVideoId: videoMeta.videoId,
        youtubeChannelId: videoMeta.channelId,
        youtubeChannelTitle: videoMeta.channelTitle,
        thumbnailUrl: videoMeta.thumbnailUrl,
        type,
        costPerAction,
        targetQuantity: qty,
        completedQuantity: 0,
        remainingQuantity: qty,
        totalBudget,
        reservedCoins: totalBudget,
        spentCoins: 0,
        category: category || 'Entertainment',
        language: language || 'English',
        targetAudience: targetAudience || 'Global',
        status: CAMPAIGN_STATUS.ACTIVE,
      });

      await campaign.save();

      // Reserve coins atomically in user escrow
      await CoinLedgerService.reserveCampaignBudget(
        user._id,
        totalBudget,
        campaign._id,
        campaign.title
      );

      // Increment creator campaign count
      user.campaignsCreated += 1;
      await user.save();

      res.status(201).json({
        success: true,
        data: { campaign },
        message: 'Campaign created and launched successfully!',
      });
    } catch (error: any) {
      console.error('[Create Campaign Error]', error);
      res.status(500).json({
        success: false,
        error: { code: 'CAMPAIGN_CREATE_FAILED', message: error.message || 'Failed to create campaign' },
      });
    }
  }

  /**
   * Get Discovery Feed of active campaigns
   */
  static async getDiscoverCampaigns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const type = req.query.type as string;
      const category = req.query.category as string;
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const skip = (page - 1) * limit;

      const filter: any = { status: CAMPAIGN_STATUS.ACTIVE };

      if (type && Object.values(CAMPAIGN_TYPES).includes(type as any)) {
        filter.type = type;
      }
      if (category && category !== 'All') {
        filter.category = category;
      }
      if (search && search.trim()) {
        filter.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { youtubeChannelTitle: { $regex: search.trim(), $options: 'i' } },
        ];
      }

      const [campaigns, total] = await Promise.all([
        Campaign.find(filter)
          .populate('creatorId', 'name username avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Campaign.countDocuments(filter),
      ]);

      // If user is authenticated, check which campaigns they've already participated in
      let participatedCampaignIds: string[] = [];
      if (req.user) {
        const participations = await CampaignParticipation.find({
          userId: req.user._id,
          campaignId: { $in: campaigns.map((c) => c._id) },
        }).select('campaignId status');

        participatedCampaignIds = participations.map((p) => p.campaignId.toString());
      }

      res.status(200).json({
        success: true,
        data: {
          campaigns,
          participatedCampaignIds,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'DISCOVER_FETCH_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get campaigns created by logged-in user
   */
  static async getMyCampaigns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const status = req.query.status as string;
      const filter: any = { creatorId: user._id };
      if (status && status !== 'ALL') {
        filter.status = status;
      }

      const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { campaigns },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'MY_CAMPAIGNS_FETCH_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get single campaign by ID
   */
  static async getCampaignById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const campaign = await Campaign.findById(id).populate('creatorId', 'name username avatar');
      if (!campaign) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Campaign not found' },
        });
        return;
      }

      let participation = null;
      if (req.user) {
        participation = await CampaignParticipation.findOne({
          campaignId: campaign._id,
          userId: req.user._id,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          campaign,
          userParticipation: participation,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'CAMPAIGN_FETCH_ERROR', message: error.message },
      });
    }
  }

  /**
   * Update campaign status (Pause, Resume, Cancel with refund)
   */
  static async updateCampaignStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { action } = req.body; // 'PAUSE', 'RESUME', 'CANCEL'

      const campaign = await Campaign.findOne({ _id: id, creatorId: user._id });
      if (!campaign) {
        res.status(404).json({
          success: false,
          error: { code: 'CAMPAIGN_NOT_FOUND', message: 'Campaign not found or unauthorized' },
        });
        return;
      }

      if (action === 'PAUSE' && campaign.status === CAMPAIGN_STATUS.ACTIVE) {
        campaign.status = CAMPAIGN_STATUS.PAUSED;
        await campaign.save();
        res.status(200).json({ success: true, data: { campaign }, message: 'Campaign paused successfully' });
        return;
      }

      if (action === 'RESUME' && campaign.status === CAMPAIGN_STATUS.PAUSED) {
        if (campaign.reservedCoins <= 0) {
          res.status(400).json({ success: false, error: { code: 'NO_BUDGET', message: 'Campaign has no remaining budget to resume.' } });
          return;
        }
        campaign.status = CAMPAIGN_STATUS.ACTIVE;
        await campaign.save();
        res.status(200).json({ success: true, data: { campaign }, message: 'Campaign resumed' });
        return;
      }

      if (action === 'CANCEL') {
        if (campaign.status === CAMPAIGN_STATUS.COMPLETED || campaign.status === CAMPAIGN_STATUS.CANCELLED) {
          res.status(400).json({ success: false, error: { code: 'ALREADY_CLOSED', message: 'Campaign is already finished or cancelled.' } });
          return;
        }

        const unspentCoins = campaign.reservedCoins;
        campaign.status = CAMPAIGN_STATUS.CANCELLED;
        campaign.reservedCoins = 0;
        await campaign.save();

        if (unspentCoins > 0) {
          await CoinLedgerService.refundReservedCoins(
            user._id,
            unspentCoins,
            campaign._id,
            campaign.title
          );
        }

        res.status(200).json({
          success: true,
          data: { campaign, refundedCoins: unspentCoins },
          message: `Campaign cancelled. ${unspentCoins} unused coins have been refunded to your wallet.`,
        });
        return;
      }

      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ACTION', message: 'Invalid status action requested' },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_STATUS_FAILED', message: error.message },
      });
    }
  }
}
