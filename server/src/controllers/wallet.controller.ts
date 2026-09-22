import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { CoinPurchaseRequest } from '../models/CoinPurchaseRequest.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { DEFAULT_COIN_PACKAGES } from '../constants/index.js';

export class WalletController {
  /**
   * Get user wallet balance, stats, and active coin purchase packages
   */
  static async getWalletOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const settings = await SystemSetting.findOne();
      const packages = settings?.coinPackages || DEFAULT_COIN_PACKAGES;

      const recentTransactions = await CoinTransaction.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(200).json({
        success: true,
        data: {
          coins: user.coins,
          reservedCoins: user.reservedCoins,
          totalEarned: user.totalEarned,
          totalSpent: user.totalSpent,
          packages,
          recentTransactions,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'WALLET_FETCH_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get full paginated transaction history
   */
  static async getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        CoinTransaction.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        CoinTransaction.countDocuments({ userId: user._id }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          transactions,
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
        error: { code: 'TRANSACTIONS_FETCH_FAILED', message: error.message },
      });
    }
  }

  /**
   * Submit coin purchase request
   */
  static async createPurchaseRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { packageId, paymentMethod, paymentNotes } = req.body;

      const settings = await SystemSetting.findOne();
      const packages = settings?.coinPackages || DEFAULT_COIN_PACKAGES;

      const selectedPackage = packages.find((p) => p.id === packageId || p.coins === parseInt(packageId, 10));
      if (!selectedPackage) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PACKAGE', message: 'Selected coin package does not exist.' },
        });
        return;
      }

      const requestId = `REQ-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

      const purchaseRequest = await CoinPurchaseRequest.create({
        requestId,
        userId: user._id,
        coinAmount: selectedPackage.coins,
        price: selectedPackage.price,
        currency: 'USD',
        paymentMethod: paymentMethod || 'MANUAL_TRANSFER',
        paymentNotes: paymentNotes || '',
        status: 'PENDING',
      });

      res.status(201).json({
        success: true,
        data: { purchaseRequest },
        message: `Coin purchase request #${requestId} submitted successfully. An admin will review and approve your coins.`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'PURCHASE_REQUEST_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get user's purchase requests
   */
  static async getMyPurchaseRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const requests = await CoinPurchaseRequest.find({ userId: user._id }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { requests },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'PURCHASE_HISTORY_FAILED', message: error.message },
      });
    }
  }
}
