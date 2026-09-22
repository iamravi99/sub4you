import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { User } from '../models/User.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { CoinLedgerService } from '../services/coinLedger.service.js';
import { ROLES, TRANSACTION_TYPES } from '../constants/index.js';
import { env } from '../config/env.js';

export class AuthController {
  /**
   * Synchronize or create user in MongoDB upon Firebase authentication
   */
  static async syncUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { uid, email, name, avatar } = req.body;
      const targetUid = uid || req.firebaseUid;
      const targetEmail = (email || req.userEmail || '').toLowerCase().trim();

      if (!targetUid || !targetEmail) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_CREDENTIALS', message: 'Firebase UID and Email are required for sync.' },
        });
        return;
      }

      const isAdmin =
        targetEmail === env.INITIAL_ADMIN_EMAIL ||
        targetEmail === 'ravinder.explore@gmail.com';

      // If user is admin, clean up any conflicting orphan record holding this targetUid
      if (isAdmin) {
        await User.deleteMany({
          firebaseUid: targetUid,
          email: { $ne: targetEmail },
        });
      }

      let user = await User.findOne({ email: targetEmail });
      let isNewUser = false;

      if (user) {
        user.firebaseUid = targetUid;
        if (isAdmin) user.role = ROLES.ADMIN;
        if (name && !user.name) user.name = name;
        if (avatar && !user.avatar) user.avatar = avatar;
        await user.save();
      } else {
        user = await User.findOne({ firebaseUid: targetUid });
        if (user) {
          user.email = targetEmail;
          if (isAdmin) user.role = ROLES.ADMIN;
          if (name && !user.name) user.name = name;
          if (avatar && !user.avatar) user.avatar = avatar;
          await user.save();
        } else {
          isNewUser = true;
          const baseUsername = (targetEmail.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
          const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

          // Fetch bonus coins setting
          const settings = await SystemSetting.findOne();
          const bonusCoins = isAdmin ? 10000 : (settings?.newUserBonusCoins ?? 25);

          user = await User.create({
            firebaseUid: targetUid,
            email: targetEmail,
            name: name || (isAdmin ? 'Ravinder (Administrator)' : baseUsername) || 'Creator',
            username: uniqueUsername,
            avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUid}`,
            role: isAdmin ? ROLES.ADMIN : ROLES.USER,
            coins: 0,
            status: 'active',
          });

          // Grant signup bonus coins through auditable ledger
          if (bonusCoins > 0) {
            await CoinLedgerService.creditUserCoins(
              user._id,
              bonusCoins,
              isAdmin ? TRANSACTION_TYPES.ADMIN_ADJUSTMENT : TRANSACTION_TYPES.NEW_USER_BONUS,
              isAdmin ? 'Initial administrator platform management balance' : 'Welcome bonus coins granted on account registration'
            );
            user = await User.findById(user._id);
          }
        }
      }

      // Update IP & login time
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      if (user) {
        user.lastIpAddress = clientIp.split(',')[0].trim();
        user.lastLoginAt = new Date();
        await user.save();
      }

      res.status(200).json({
        success: true,
        data: {
          user,
          isNewUser,
        },
        message: isNewUser ? 'Account created and synced successfully' : 'Account synced successfully',
      });
    } catch (error: any) {
      console.error('[Auth Sync Error]', error);
      res.status(500).json({
        success: false,
        error: { code: 'SYNC_FAILED', message: error.message || 'Failed to sync user' },
      });
    }
  }

  /**
   * Get current authenticated user
   */
  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in' } });
        return;
      }
      res.status(200).json({
        success: true,
        data: { user: req.user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'GET_ME_FAILED', message: error.message },
      });
    }
  }
}
