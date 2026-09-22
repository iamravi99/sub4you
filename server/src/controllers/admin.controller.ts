import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { User } from '../models/User.js';
import { Campaign } from '../models/Campaign.js';
import { CoinPurchaseRequest } from '../models/CoinPurchaseRequest.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { VerificationRecord } from '../models/VerificationRecord.js';
import { AuditLog } from '../models/AuditLog.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { CoinLedgerService } from '../services/coinLedger.service.js';
import { VerificationService } from '../services/verification.service.js';
import { NotificationService } from '../services/notification.service.js';
import { AUDIT_ACTIONS, CAMPAIGN_STATUS, NOTIFICATION_TYPES, PURCHASE_STATUS, TRANSACTION_TYPES } from '../constants/index.js';

export class AdminController {
  /**
   * Get Platform Dashboard KPI Statistics
   */
  static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        activeUsers,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        pendingCoinRequests,
        pendingVerifications,
        suspiciousUsersCount,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: 'active' }),
        Campaign.countDocuments(),
        Campaign.countDocuments({ status: CAMPAIGN_STATUS.ACTIVE }),
        Campaign.countDocuments({ status: CAMPAIGN_STATUS.COMPLETED }),
        CoinPurchaseRequest.countDocuments({ status: PURCHASE_STATUS.PENDING }),
        VerificationRecord.countDocuments({ status: 'REVIEW' }),
        User.countDocuments({ riskScore: { $gte: 70 } }),
      ]);

      // Aggregate Total Coins Issued & Spent
      const coinAgg = await CoinTransaction.aggregate([
        {
          $group: {
            _id: null,
            totalIssued: {
              $sum: {
                $cond: [{ $in: ['$type', [TRANSACTION_TYPES.PURCHASE, TRANSACTION_TYPES.NEW_USER_BONUS, TRANSACTION_TYPES.ADMIN_ADJUSTMENT]] }, '$amount', 0],
              },
            },
            totalSpent: {
              $sum: {
                $cond: [{ $eq: ['$type', TRANSACTION_TYPES.CAMPAIGN_RESERVE] }, { $abs: '$amount' }, 0],
              },
            },
          },
        },
      ]);

      // Calculate Revenue from approved Coin Purchase Requests
      const revenueAgg = await CoinPurchaseRequest.aggregate([
        { $match: { status: PURCHASE_STATUS.APPROVED } },
        { $group: { _id: null, totalRevenue: { $sum: '$price' } } },
      ]);

      const totalCoinsIssued = coinAgg[0]?.totalIssued || 0;
      const totalCoinsSpent = coinAgg[0]?.totalSpent || 0;
      const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

      // Recent 7 days activity chart data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailyCampaigns = await Campaign.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalUsers,
            activeUsers,
            totalCampaigns,
            activeCampaigns,
            completedCampaigns,
            totalCoinsIssued,
            totalCoinsSpent,
            pendingCoinRequests,
            pendingVerifications,
            suspiciousAccounts: suspiciousUsersCount,
            totalRevenue,
          },
          charts: {
            dailyCampaigns,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'ADMIN_DASHBOARD_ERROR', message: error.message },
      });
    }
  }

  /**
   * Get all users (searchable, filterable)
   */
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (status && status !== 'ALL') {
        filter.status = status;
      }
      if (search && search.trim()) {
        filter.$or = [
          { email: { $regex: search.trim(), $options: 'i' } },
          { name: { $regex: search.trim(), $options: 'i' } },
          { username: { $regex: search.trim(), $options: 'i' } },
          { firebaseUid: { $regex: search.trim(), $options: 'i' } },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users,
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
        error: { code: 'ADMIN_USERS_FETCH_ERROR', message: error.message },
      });
    }
  }

  /**
   * Update user status (Active, Suspended, Flagged)
   */
  static async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const admin = req.user!;
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!['active', 'suspended', 'flagged'].includes(status)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_STATUS', message: 'Status must be active, suspended, or flagged' },
        });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
        return;
      }

      const previousStatus = user.status;
      user.status = status;
      await user.save();

      // Audit Log
      await AuditLog.create({
        adminId: admin._id,
        action: status === 'suspended' ? AUDIT_ACTIONS.SUSPEND_USER : AUDIT_ACTIONS.REACTIVATE_USER,
        targetType: 'USER',
        targetId: user._id.toString(),
        details: { previousStatus, newStatus: status, reason },
        ipAddress: req.ip,
      });

      if (status === 'suspended') {
        await NotificationService.sendNotification({
          userId: user._id,
          type: NOTIFICATION_TYPES.ACCOUNT_WARNING,
          title: 'Account Suspended',
          message: `Your account has been suspended: ${reason || 'Violation of platform terms.'}`,
        });
      }

      res.status(200).json({
        success: true,
        data: { user },
        message: `User status updated to ${status}`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'USER_STATUS_UPDATE_FAILED', message: error.message },
      });
    }
  }

  /**
   * Adjust user coin balance manually
   */
  static async adjustUserCoins(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const admin = req.user!;
      const id = req.params.id as string;
      const { amount, reason } = req.body;

      const numAmount = parseInt(amount, 10);
      if (isNaN(numAmount) || numAmount === 0) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_AMOUNT', message: 'Adjustment amount must be a non-zero integer' },
        });
        return;
      }

      if (!reason || reason.trim() === '') {
        res.status(400).json({
          success: false,
          error: { code: 'REASON_REQUIRED', message: 'An administrative reason is required for audit logs.' },
        });
        return;
      }

      const { user, transaction } = await CoinLedgerService.adminAdjustCoins(
        id,
        numAmount,
        reason.trim(),
        admin._id
      );

      // Audit log
      await AuditLog.create({
        adminId: admin._id,
        action: AUDIT_ACTIONS.ADJUST_COINS,
        targetType: 'USER',
        targetId: user._id.toString(),
        details: { amount: numAmount, reason, newBalance: user.coins },
        ipAddress: req.ip,
      });

      await NotificationService.sendNotification({
        userId: user._id,
        type: numAmount > 0 ? NOTIFICATION_TYPES.COINS_RECEIVED : NOTIFICATION_TYPES.ACCOUNT_WARNING,
        title: numAmount > 0 ? 'Coins Added to Wallet' : 'Coins Deducted from Wallet',
        message: `An administrator adjusted your balance by ${numAmount > 0 ? '+' : ''}${numAmount} coins. Reason: ${reason}`,
        link: '/wallet',
      });

      res.status(200).json({
        success: true,
        data: { user, transaction },
        message: `Successfully adjusted user balance by ${numAmount} coins.`,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'COIN_ADJUSTMENT_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get all campaigns for admin moderation
   */
  static async getCampaigns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as string;
      const search = req.query.search as string;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (status && status !== 'ALL') {
        filter.status = status;
      }
      if (search && search.trim()) {
        filter.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { youtubeVideoId: { $regex: search.trim(), $options: 'i' } },
        ];
      }

      const [campaigns, total] = await Promise.all([
        Campaign.find(filter)
          .populate('creatorId', 'name email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Campaign.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          campaigns,
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
        error: { code: 'ADMIN_CAMPAIGNS_FETCH_FAILED', message: error.message },
      });
    }
  }

  /**
   * Moderate campaign (Pause, Resume, Cancel with refund, Reject)
   */
  static async moderateCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const admin = req.user!;
      const { id } = req.params;
      const { action, reason } = req.body;

      const campaign = await Campaign.findById(id);
      if (!campaign) {
        res.status(404).json({ success: false, error: { code: 'CAMPAIGN_NOT_FOUND', message: 'Campaign not found' } });
        return;
      }

      if (action === 'PAUSE') {
        campaign.status = CAMPAIGN_STATUS.PAUSED;
        await campaign.save();
      } else if (action === 'RESUME') {
        campaign.status = CAMPAIGN_STATUS.ACTIVE;
        await campaign.save();
      } else if (action === 'CANCEL' || action === 'REJECT') {
        const unspent = campaign.reservedCoins;
        campaign.status = action === 'CANCEL' ? CAMPAIGN_STATUS.CANCELLED : CAMPAIGN_STATUS.REJECTED;
        campaign.reservedCoins = 0;
        await campaign.save();

        if (unspent > 0) {
          await CoinLedgerService.refundReservedCoins(
            campaign.creatorId,
            unspent,
            campaign._id,
            campaign.title
          );
        }
      }

      await AuditLog.create({
        adminId: admin._id,
        action: action === 'PAUSE' ? AUDIT_ACTIONS.PAUSE_CAMPAIGN : AUDIT_ACTIONS.CANCEL_CAMPAIGN,
        targetType: 'CAMPAIGN',
        targetId: campaign._id.toString(),
        details: { action, reason, campaignTitle: campaign.title },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: { campaign },
        message: `Campaign action "${action}" completed.`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'CAMPAIGN_MODERATION_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get Coin Purchase Requests
   */
  static async getCoinRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as string;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (status && status !== 'ALL') {
        filter.status = status;
      }

      const [requests, total] = await Promise.all([
        CoinPurchaseRequest.find(filter)
          .populate('userId', 'name email username coins')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        CoinPurchaseRequest.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          requests,
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
        error: { code: 'COIN_REQUESTS_FETCH_FAILED', message: error.message },
      });
    }
  }

  /**
   * Approve Coin Purchase Request
   */
  static async approveCoinRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const admin = req.user!;
      const { id } = req.params;
      const { adminNotes } = req.body;

      const request = await CoinPurchaseRequest.findById(id);
      if (!request || request.status !== PURCHASE_STATUS.PENDING) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'Request not found or already processed.' },
        });
        return;
      }

      // Credit coins via ledger
      await CoinLedgerService.creditUserCoins(
        request.userId,
        request.coinAmount,
        TRANSACTION_TYPES.PURCHASE,
        `Coin purchase approved (Request #${request.requestId})`,
        request._id,
        'COIN_PURCHASE_REQUEST'
      );

      request.status = PURCHASE_STATUS.APPROVED;
      request.processedBy = admin._id;
      request.processedAt = new Date();
      request.adminNotes = adminNotes || 'Approved by admin';
      await request.save();

      // Audit Log
      await AuditLog.create({
        adminId: admin._id,
        action: AUDIT_ACTIONS.APPROVE_COIN_REQUEST,
        targetType: 'PURCHASE_REQUEST',
        targetId: request._id.toString(),
        details: { requestId: request.requestId, coins: request.coinAmount, price: request.price },
        ipAddress: req.ip,
      });

      // Notify User
      await NotificationService.sendNotification({
        userId: request.userId,
        type: NOTIFICATION_TYPES.COINS_PURCHASE_APPROVED,
        title: 'Coin Purchase Approved!',
        message: `Your purchase request #${request.requestId} for ${request.coinAmount} coins has been approved and added to your balance!`,
        link: '/wallet',
      });

      res.status(200).json({
        success: true,
        data: { request },
        message: `Coin request approved. ${request.coinAmount} coins credited to user.`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'APPROVE_FAILED', message: error.message },
      });
    }
  }

  /**
   * Reject Coin Purchase Request
   */
  static async rejectCoinRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const admin = req.user!;
      const { id } = req.params;
      const { rejectionReason } = req.body;

      const request = await CoinPurchaseRequest.findById(id);
      if (!request || request.status !== PURCHASE_STATUS.PENDING) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'Request not found or already processed.' },
        });
        return;
      }

      request.status = PURCHASE_STATUS.REJECTED;
      request.processedBy = admin._id;
      request.processedAt = new Date();
      request.adminNotes = rejectionReason || 'Declined by administration';
      await request.save();

      // Audit Log
      await AuditLog.create({
        adminId: admin._id,
        action: AUDIT_ACTIONS.REJECT_COIN_REQUEST,
        targetType: 'PURCHASE_REQUEST',
        targetId: request._id.toString(),
        details: { requestId: request.requestId, rejectionReason },
        ipAddress: req.ip,
      });

      // Notify User
      await NotificationService.sendNotification({
        userId: request.userId,
        type: NOTIFICATION_TYPES.COINS_PURCHASE_REJECTED,
        title: 'Coin Purchase Declined',
        message: `Your purchase request #${request.requestId} was declined. Reason: ${request.adminNotes}`,
        link: '/wallet',
      });

      res.status(200).json({
        success: true,
        data: { request },
        message: 'Coin request rejected.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'REJECT_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get verification review queue
   */
  static async getVerificationQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const records = await VerificationRecord.find({ status: 'REVIEW' })
        .populate('userId', 'name email username riskScore')
        .populate('campaignId', 'title type costPerAction thumbnailUrl')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { queue: records },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'VERIFICATION_QUEUE_ERROR', message: error.message },
      });
    }
  }

  /**
   * Approve verification record in queue
   */
  static async approveVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const admin = req.user!;
      const id = req.params.id as string;
      const { notes } = req.body;

      const result = await VerificationService.adminApproveVerification(
        id,
        admin._id.toString(),
        notes
      );

      await AuditLog.create({
        adminId: admin._id,
        action: AUDIT_ACTIONS.APPROVE_VERIFICATION,
        targetType: 'VERIFICATION',
        targetId: id,
        details: { notes },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Verification approved and reward released.',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'VERIFICATION_APPROVE_ERROR', message: error.message },
      });
    }
  }

  /**
   * Reject verification record in queue
   */
  static async rejectVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const admin = req.user!;
      const id = req.params.id as string;
      const { reason } = req.body;

      const result = await VerificationService.adminRejectVerification(
        id,
        admin._id.toString(),
        reason || 'Unverified action'
      );

      await AuditLog.create({
        adminId: admin._id,
        action: AUDIT_ACTIONS.REJECT_VERIFICATION,
        targetType: 'VERIFICATION',
        targetId: id,
        details: { reason },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Verification rejected.',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'VERIFICATION_REJECT_ERROR', message: error.message },
      });
    }
  }

  /**
   * Get Platform Audit Logs
   */
  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 30;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find()
          .populate('adminId', 'name email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        AuditLog.countDocuments(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          logs,
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
        error: { code: 'AUDIT_LOGS_FETCH_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get System Settings
   */
  static async getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let settings = await SystemSetting.findOne();
      if (!settings) {
        settings = await SystemSetting.create({});
      }

      res.status(200).json({
        success: true,
        data: { settings },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SETTINGS_FETCH_FAILED', message: error.message },
      });
    }
  }

  /**
   * Update System Settings
   */
  static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const admin = req.user!;
      const updateData = req.body;

      let settings = await SystemSetting.findOne();
      if (!settings) {
        settings = new SystemSetting();
      }

      if (updateData.coinPackages) settings.coinPackages = updateData.coinPackages;
      if (typeof updateData.campaignMinBudget === 'number') settings.campaignMinBudget = updateData.campaignMinBudget;
      if (typeof updateData.campaignMaxBudget === 'number') settings.campaignMaxBudget = updateData.campaignMaxBudget;
      if (typeof updateData.maxActiveCampaignsPerUser === 'number') settings.maxActiveCampaignsPerUser = updateData.maxActiveCampaignsPerUser;
      if (updateData.rewardRates) settings.rewardRates = updateData.rewardRates;
      if (typeof updateData.newUserBonusCoins === 'number') settings.newUserBonusCoins = updateData.newUserBonusCoins;
      if (typeof updateData.fraudThresholdReview === 'number') settings.fraudThresholdReview = updateData.fraudThresholdReview;
      if (typeof updateData.fraudThresholdBlock === 'number') settings.fraudThresholdBlock = updateData.fraudThresholdBlock;
      if (typeof updateData.maintenanceMode === 'boolean') settings.maintenanceMode = updateData.maintenanceMode;

      settings.updatedBy = admin._id;
      settings.updatedAt = new Date();
      await settings.save();

      await AuditLog.create({
        adminId: admin._id,
        action: AUDIT_ACTIONS.UPDATE_SYSTEM_SETTINGS,
        targetType: 'SETTINGS',
        targetId: settings._id.toString(),
        details: updateData,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: { settings },
        message: 'System settings updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SETTINGS_UPDATE_FAILED', message: error.message },
      });
    }
  }
}
