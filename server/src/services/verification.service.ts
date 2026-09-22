import { Types } from 'mongoose';
import { Campaign } from '../models/Campaign.js';
import { CampaignParticipation } from '../models/CampaignParticipation.js';
import { VerificationRecord } from '../models/VerificationRecord.js';
import { CoinLedgerService } from './coinLedger.service.js';
import { FraudService } from './fraud.service.js';
import { NotificationService } from './notification.service.js';
import { NOTIFICATION_TYPES, PARTICIPATION_STATUS, CAMPAIGN_STATUS } from '../constants/index.js';

export interface VerificationSubmissionResult {
  status: string;
  rewardEarned: number;
  message: string;
  riskScore: number;
  participation: any;
}

export class VerificationService {
  /**
   * Process campaign action verification request
   */
  static async processVerification(params: {
    campaignId: string;
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    actionTimeSeconds?: number;
    youtubeAccount?: string;
  }): Promise<VerificationSubmissionResult> {
    const { campaignId, userId, ipAddress, userAgent, actionTimeSeconds, youtubeAccount } = params;

    // 1. Fetch Campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== CAMPAIGN_STATUS.ACTIVE) {
      throw new Error(`Campaign is not active (Current status: ${campaign.status})`);
    }

    if (campaign.creatorId.toString() === userId) {
      throw new Error('You cannot participate in your own campaign.');
    }

    if (campaign.remainingQuantity <= 0 || campaign.reservedCoins < campaign.costPerAction) {
      campaign.status = CAMPAIGN_STATUS.COMPLETED;
      await campaign.save();
      throw new Error('Campaign target has already been achieved.');
    }

    // 2. Check for existing participation
    let participation = await CampaignParticipation.findOne({
      campaignId: campaign._id,
      userId: new Types.ObjectId(userId),
    });

    if (participation && (participation.status === PARTICIPATION_STATUS.VERIFIED || participation.status === PARTICIPATION_STATUS.REVIEW)) {
      throw new Error('You have already submitted or verified your participation for this campaign.');
    }

    // 3. Anti-Fraud risk analysis
    const fraudEval = await FraudService.evaluateActionRisk({
      userId,
      campaignId,
      ipAddress,
      userAgent,
      actionTimeSeconds,
    });

    // 4. Create or update participation record
    if (!participation) {
      participation = new CampaignParticipation({
        campaignId: campaign._id,
        userId: new Types.ObjectId(userId),
        creatorId: campaign.creatorId,
        actionType: campaign.type,
        rewardAmount: campaign.costPerAction,
        riskScore: fraudEval.riskScore,
        ipAddress,
        userAgent,
        youtubeAccountUsed: youtubeAccount,
      });
    } else {
      participation.riskScore = fraudEval.riskScore;
      participation.ipAddress = ipAddress;
      participation.userAgent = userAgent;
      participation.youtubeAccountUsed = youtubeAccount;
    }

    // 5. Handle Status based on Risk & Policy
    if (fraudEval.shouldBlock) {
      participation.status = PARTICIPATION_STATUS.FAILED;
      participation.verificationDetails = `Blocked by anti-fraud: ${fraudEval.riskFactors.join(', ')}`;
      await participation.save();

      await NotificationService.sendNotification({
        userId,
        type: NOTIFICATION_TYPES.VERIFICATION_FAILED,
        title: 'Action Verification Failed',
        message: `Your action on "${campaign.title}" failed verification due to high risk indicators.`,
      });

      return {
        status: PARTICIPATION_STATUS.FAILED,
        rewardEarned: 0,
        message: 'Action verification failed due to risk anomalies.',
        riskScore: fraudEval.riskScore,
        participation,
      };
    }

    if (fraudEval.requiresManualReview) {
      participation.status = PARTICIPATION_STATUS.REVIEW;
      participation.verificationDetails = `Held for moderation: ${fraudEval.riskFactors.join(', ')}`;
      await participation.save();

      // Create admin verification record
      await VerificationRecord.create({
        participationId: participation._id,
        campaignId: campaign._id,
        userId: new Types.ObjectId(userId),
        youtubeAccount,
        verificationMethod: 'MANUAL_ADMIN_REVIEW',
        status: 'REVIEW',
        riskScore: fraudEval.riskScore,
      });

      return {
        status: PARTICIPATION_STATUS.REVIEW,
        rewardEarned: 0,
        message: 'Action submitted! Verification is pending manual review by moderators.',
        riskScore: fraudEval.riskScore,
        participation,
      };
    }

    // 6. Instant Verified Settlement
    participation.status = PARTICIPATION_STATUS.VERIFIED;
    participation.completedAt = new Date();
    await participation.save();

    // Deduct from campaign escrow
    campaign.completedQuantity += 1;
    campaign.remainingQuantity = Math.max(0, campaign.targetQuantity - campaign.completedQuantity);
    campaign.reservedCoins = Math.max(0, campaign.reservedCoins - campaign.costPerAction);
    campaign.spentCoins += campaign.costPerAction;

    if (campaign.completedQuantity >= campaign.targetQuantity || campaign.reservedCoins < campaign.costPerAction) {
      campaign.status = CAMPAIGN_STATUS.COMPLETED;
    }
    await campaign.save();

    // Reward participant via ledger
    await CoinLedgerService.rewardParticipant(
      userId,
      campaign.costPerAction,
      campaign._id,
      campaign.type
    );

    // Notify participant
    await NotificationService.sendNotification({
      userId,
      type: NOTIFICATION_TYPES.COINS_RECEIVED,
      title: 'Coins Earned!',
      message: `You earned ${campaign.costPerAction} coin(s) for completing action on "${campaign.title}".`,
      link: '/wallet',
    });

    // If campaign completed, notify creator
    if (campaign.status === CAMPAIGN_STATUS.COMPLETED) {
      await NotificationService.sendNotification({
        userId: campaign.creatorId,
        type: NOTIFICATION_TYPES.CAMPAIGN_COMPLETED,
        title: 'Campaign Goal Reached!',
        message: `Your campaign "${campaign.title}" has reached its full target of ${campaign.targetQuantity} actions!`,
        link: '/campaigns',
      });
    }

    return {
      status: PARTICIPATION_STATUS.VERIFIED,
      rewardEarned: campaign.costPerAction,
      message: `Action verified! You received ${campaign.costPerAction} coin(s).`,
      riskScore: fraudEval.riskScore,
      participation,
    };
  }

  /**
   * Admin approves a queued verification
   */
  static async adminApproveVerification(
    verificationId: string,
    adminId: string,
    adminNotes?: string
  ): Promise<any> {
    const record = await VerificationRecord.findById(verificationId);
    if (!record || record.status !== 'REVIEW') {
      throw new Error('Verification record not found or already processed');
    }

    const participation = await CampaignParticipation.findById(record.participationId);
    if (!participation) {
      throw new Error('Associated participation not found');
    }

    const campaign = await Campaign.findById(record.campaignId);
    if (!campaign) {
      throw new Error('Associated campaign not found');
    }

    // Settle campaign and user
    participation.status = PARTICIPATION_STATUS.VERIFIED;
    participation.completedAt = new Date();
    await participation.save();

    campaign.completedQuantity += 1;
    campaign.remainingQuantity = Math.max(0, campaign.targetQuantity - campaign.completedQuantity);
    campaign.reservedCoins = Math.max(0, campaign.reservedCoins - campaign.costPerAction);
    campaign.spentCoins += campaign.costPerAction;
    if (campaign.completedQuantity >= campaign.targetQuantity) {
      campaign.status = CAMPAIGN_STATUS.COMPLETED;
    }
    await campaign.save();

    await CoinLedgerService.rewardParticipant(
      participation.userId,
      campaign.costPerAction,
      campaign._id,
      campaign.type
    );

    record.status = 'VERIFIED';
    record.reviewedBy = new Types.ObjectId(adminId);
    record.adminReviewNotes = adminNotes || 'Approved by admin review';
    await record.save();

    await NotificationService.sendNotification({
      userId: participation.userId,
      type: NOTIFICATION_TYPES.COINS_RECEIVED,
      title: 'Action Approved & Coins Rewarded!',
      message: `Your action on "${campaign.title}" has been reviewed and approved! You received ${campaign.costPerAction} coin(s).`,
      link: '/wallet',
    });

    return { record, participation };
  }

  /**
   * Admin rejects a queued verification
   */
  static async adminRejectVerification(
    verificationId: string,
    adminId: string,
    rejectionReason: string
  ): Promise<any> {
    const record = await VerificationRecord.findById(verificationId);
    if (!record || record.status !== 'REVIEW') {
      throw new Error('Verification record not found or already processed');
    }

    const participation = await CampaignParticipation.findById(record.participationId);
    if (participation) {
      participation.status = PARTICIPATION_STATUS.FAILED;
      participation.verificationDetails = rejectionReason;
      await participation.save();
    }

    record.status = 'FAILED';
    record.reviewedBy = new Types.ObjectId(adminId);
    record.adminReviewNotes = rejectionReason;
    await record.save();

    if (participation) {
      await NotificationService.sendNotification({
        userId: participation.userId,
        type: NOTIFICATION_TYPES.VERIFICATION_FAILED,
        title: 'Verification Request Declined',
        message: `Your verification submission was rejected: ${rejectionReason}`,
      });
    }

    return { record, participation };
  }
}
