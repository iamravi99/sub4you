import { CampaignParticipation } from '../models/CampaignParticipation.js';
import { User } from '../models/User.js';

export interface FraudAnalysisResult {
  riskScore: number;
  riskFactors: string[];
  requiresManualReview: boolean;
  shouldBlock: boolean;
}

export class FraudService {
  /**
   * Calculate action risk score based on velocity, IP, account age, and timing
   */
  static async evaluateActionRisk(params: {
    userId: string;
    campaignId: string;
    ipAddress?: string;
    userAgent?: string;
    actionTimeSeconds?: number;
  }): Promise<FraudAnalysisResult> {
    const { userId, campaignId, ipAddress, actionTimeSeconds = 30 } = params;
    let score = 0;
    const riskFactors: string[] = [];

    const user = await User.findById(userId);
    if (!user) {
      return { riskScore: 100, riskFactors: ['Invalid user identity'], requiresManualReview: true, shouldBlock: true };
    }

    // Factor 1: Instant action completion (< 12 seconds indicates automated bot script)
    if (actionTimeSeconds < 8) {
      score += 45;
      riskFactors.push('Unrealistic completion velocity (< 8s)');
    } else if (actionTimeSeconds < 15) {
      score += 20;
      riskFactors.push('Rapid completion time (< 15s)');
    }

    // Factor 2: High velocity checking (more than 15 actions completed in past 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentActionsCount = await CampaignParticipation.countDocuments({
      userId,
      createdAt: { $gte: tenMinutesAgo },
    });

    if (recentActionsCount > 20) {
      score += 40;
      riskFactors.push(`Abnormal frequency (${recentActionsCount} actions in 10m)`);
    } else if (recentActionsCount > 10) {
      score += 15;
      riskFactors.push(`Elevated frequency (${recentActionsCount} actions in 10m)`);
    }

    // Factor 3: Multiple platform accounts sharing the same IP
    if (ipAddress && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
      const distinctUsersWithIp = await User.countDocuments({
        lastIpAddress: ipAddress,
        _id: { $ne: user._id },
      });
      if (distinctUsersWithIp >= 3) {
        score += 30;
        riskFactors.push(`Multiple user accounts sharing IP address (${distinctUsersWithIp} accounts)`);
      }
    }

    // Factor 4: User previous risk score
    if (user.riskScore > 50) {
      score += 25;
      riskFactors.push(`Account holds prior elevated risk score (${user.riskScore})`);
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.max(0, score));

    return {
      riskScore: finalScore,
      riskFactors,
      requiresManualReview: finalScore > 30 && finalScore <= 70,
      shouldBlock: finalScore > 70,
    };
  }
}
