import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { User } from '../models/User.js';
import { Campaign } from '../models/Campaign.js';
import { CampaignParticipation } from '../models/CampaignParticipation.js';

export class UserController {
  /**
   * Get authenticated user dashboard statistics
   */
  static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const activeCampaignsCount = await Campaign.countDocuments({
        creatorId: user._id,
        status: 'ACTIVE',
      });

      const totalCampaignsCount = await Campaign.countDocuments({
        creatorId: user._id,
      });

      const participationsCount = await CampaignParticipation.countDocuments({
        userId: user._id,
        status: 'VERIFIED',
      });

      // Calculate success rate
      const totalAttempts = await CampaignParticipation.countDocuments({ userId: user._id });
      const successRate = totalAttempts > 0 ? Math.round((participationsCount / totalAttempts) * 100) : 100;

      res.status(200).json({
        success: true,
        data: {
          user,
          stats: {
            activeCampaigns: activeCampaignsCount,
            totalCampaigns: totalCampaignsCount,
            verifiedActions: participationsCount,
            successRate,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'PROFILE_FETCH_FAILED', message: error.message },
      });
    }
  }

  /**
   * Update user editable profile fields (Name, Bio, Avatar, Username)
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { name, bio, avatar, username } = req.body;

      if (name && typeof name === 'string') {
        user.name = name.trim().slice(0, 100);
      }
      if (bio !== undefined && typeof bio === 'string') {
        user.bio = bio.trim().slice(0, 500);
      }
      if (avatar && typeof avatar === 'string') {
        user.avatar = avatar.trim();
      }
      if (username && typeof username === 'string') {
        const cleanUsername = username.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
        if (cleanUsername && cleanUsername !== user.username) {
          const existing = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
          if (existing) {
            res.status(400).json({
              success: false,
              error: { code: 'USERNAME_TAKEN', message: 'This username is already claimed by another creator.' },
            });
            return;
          }
          user.username = cleanUsername;
        }
      }

      await user.save();

      res.status(200).json({
        success: true,
        data: { user },
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'PROFILE_UPDATE_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get public creator profile by username
   */
  static async getPublicProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const username = (req.params.username as string) || '';
      const user = await User.findOne({ username: username.toLowerCase() }).select(
        'name username avatar bio totalEarned campaignsCreated completedActions createdAt'
      );

      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Creator profile not found' },
        });
        return;
      }

      const activeCampaigns = await Campaign.find({
        creatorId: user._id,
        status: 'ACTIVE',
      }).select('title type thumbnailUrl costPerAction targetQuantity completedQuantity');

      res.status(200).json({
        success: true,
        data: {
          creator: user,
          campaigns: activeCampaigns,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'FETCH_PUBLIC_PROFILE_FAILED', message: error.message },
      });
    }
  }
}
