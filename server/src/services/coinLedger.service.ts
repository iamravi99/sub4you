import { Types } from 'mongoose';
import { User, IUser } from '../models/User.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { TRANSACTION_TYPES } from '../constants/index.js';

export class CoinLedgerService {
  /**
   * Credit coins directly to a user (e.g. Purchase approval, Admin adjustment, Signup bonus)
   */
  static async creditUserCoins(
    userId: string | Types.ObjectId,
    amount: number,
    type: string,
    description: string,
    referenceId?: string | Types.ObjectId,
    referenceType?: string
  ): Promise<{ user: IUser; transaction: any }> {
    if (amount <= 0) {
      throw new Error('Credit amount must be greater than zero');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const balanceBefore = user.coins;
    user.coins += amount;
    user.totalEarned += amount;
    const balanceAfter = user.coins;

    await user.save();

    const transaction = await CoinTransaction.create({
      userId: user._id,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      referenceId: referenceId ? new Types.ObjectId(referenceId.toString()) : undefined,
      referenceType,
      description,
    });

    return { user, transaction };
  }

  /**
   * Reserve coins for a new campaign (moves available coins -> reserved escrow)
   */
  static async reserveCampaignBudget(
    userId: string | Types.ObjectId,
    budget: number,
    campaignId: string | Types.ObjectId,
    campaignTitle: string
  ): Promise<{ user: IUser; transaction: any }> {
    if (budget <= 0) {
      throw new Error('Campaign budget must be greater than zero');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.coins < budget) {
      throw new Error(`Insufficient available coins. Available: ${user.coins}, Required: ${budget}`);
    }

    const balanceBefore = user.coins;
    user.coins -= budget;
    user.reservedCoins += budget;
    user.totalSpent += budget;
    const balanceAfter = user.coins;

    await user.save();

    const transaction = await CoinTransaction.create({
      userId: user._id,
      type: TRANSACTION_TYPES.CAMPAIGN_RESERVE,
      amount: -budget,
      balanceBefore,
      balanceAfter,
      referenceId: new Types.ObjectId(campaignId.toString()),
      referenceType: 'CAMPAIGN',
      description: `Escrow budget reserved for campaign: "${campaignTitle}"`,
    });

    return { user, transaction };
  }

  /**
   * Release reserved coins back to creator (e.g. Campaign cancelled or expired with unspent budget)
   */
  static async refundReservedCoins(
    userId: string | Types.ObjectId,
    unspentAmount: number,
    campaignId: string | Types.ObjectId,
    campaignTitle: string
  ): Promise<{ user: IUser; transaction: any }> {
    if (unspentAmount <= 0) return { user: (await User.findById(userId))!, transaction: null };

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const balanceBefore = user.coins;
    user.coins += unspentAmount;
    user.reservedCoins = Math.max(0, user.reservedCoins - unspentAmount);
    user.totalSpent = Math.max(0, user.totalSpent - unspentAmount);
    const balanceAfter = user.coins;

    await user.save();

    const transaction = await CoinTransaction.create({
      userId: user._id,
      type: TRANSACTION_TYPES.CAMPAIGN_REFUND,
      amount: unspentAmount,
      balanceBefore,
      balanceAfter,
      referenceId: new Types.ObjectId(campaignId.toString()),
      referenceType: 'CAMPAIGN',
      description: `Refunded unspent escrow from campaign: "${campaignTitle}"`,
    });

    return { user, transaction };
  }

  /**
   * Settle verified reward to participant
   */
  static async rewardParticipant(
    participantId: string | Types.ObjectId,
    rewardAmount: number,
    campaignId: string | Types.ObjectId,
    actionType: string
  ): Promise<{ user: IUser; transaction: any }> {
    const user = await User.findById(participantId);
    if (!user) {
      throw new Error('Participant user not found');
    }

    const balanceBefore = user.coins;
    user.coins += rewardAmount;
    user.totalEarned += rewardAmount;
    user.completedActions += 1;
    const balanceAfter = user.coins;

    await user.save();

    const transaction = await CoinTransaction.create({
      userId: user._id,
      type: TRANSACTION_TYPES.ACTION_REWARD,
      amount: rewardAmount,
      balanceBefore,
      balanceAfter,
      referenceId: new Types.ObjectId(campaignId.toString()),
      referenceType: 'CAMPAIGN',
      description: `Reward for verified ${actionType.toLowerCase()} action on campaign`,
    });

    return { user, transaction };
  }

  /**
   * Admin manual adjustment
   */
  static async adminAdjustCoins(
    userId: string | Types.ObjectId,
    adjustmentAmount: number,
    adminReason: string,
    adminId: string | Types.ObjectId
  ): Promise<{ user: IUser; transaction: any }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const balanceBefore = user.coins;
    const newBalance = user.coins + adjustmentAmount;
    if (newBalance < 0) {
      throw new Error('Adjustment would result in negative coin balance');
    }

    user.coins = newBalance;
    if (adjustmentAmount > 0) {
      user.totalEarned += adjustmentAmount;
    }
    const balanceAfter = user.coins;

    await user.save();

    const transaction = await CoinTransaction.create({
      userId: user._id,
      type: TRANSACTION_TYPES.ADMIN_ADJUSTMENT,
      amount: adjustmentAmount,
      balanceBefore,
      balanceAfter,
      referenceId: new Types.ObjectId(adminId.toString()),
      referenceType: 'ADMIN',
      description: `Admin adjustment: ${adminReason}`,
    });

    return { user, transaction };
  }
}
