export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  role: 'user' | 'admin';
  coins: number;
  reservedCoins: number;
  totalEarned: number;
  totalSpent: number;
  campaignsCreated: number;
  completedActions: number;
  status: 'active' | 'suspended' | 'flagged';
  riskScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  _id: string;
  creatorId: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
    email?: string;
  } | string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  youtubeChannelId?: string;
  youtubeChannelTitle?: string;
  thumbnailUrl: string;
  type: 'SUBSCRIBER' | 'LIKE';
  costPerAction: number;
  targetQuantity: number;
  completedQuantity: number;
  remainingQuantity: number;
  totalBudget: number;
  reservedCoins: number;
  spentCoins: number;
  category: string;
  language: string;
  targetAudience?: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED' | 'REJECTED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignParticipation {
  _id: string;
  campaignId: string;
  userId: string;
  creatorId: string;
  actionType: 'SUBSCRIBER' | 'LIKE';
  rewardAmount: number;
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'REVIEW' | 'EXPIRED';
  riskScore: number;
  ipAddress?: string;
  userAgent?: string;
  youtubeAccountUsed?: string;
  verificationDetails?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CoinTransaction {
  _id: string;
  userId: string;
  type: 'PURCHASE' | 'CAMPAIGN_RESERVE' | 'ACTION_REWARD' | 'CAMPAIGN_REFUND' | 'ADMIN_ADJUSTMENT' | 'REFERRAL_REWARD' | 'NEW_USER_BONUS';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  referenceType?: string;
  description: string;
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  label: string;
  popular: boolean;
}

export interface CoinPurchaseRequest {
  _id: string;
  requestId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    username?: string;
    coins?: number;
  } | string;
  coinAmount: number;
  price: number;
  currency: string;
  paymentMethod: string;
  paymentNotes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminNotes?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}

export interface VerificationRecord {
  _id: string;
  participationId: string;
  campaignId: {
    _id: string;
    title: string;
    type: 'SUBSCRIBER' | 'LIKE';
    costPerAction: number;
    thumbnailUrl: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    username: string;
    riskScore: number;
  };
  youtubeAccount?: string;
  verificationMethod: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'REVIEW';
  riskScore: number;
  reviewedBy?: string;
  adminReviewNotes?: string;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  adminId: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface SystemSettings {
  coinPackages: CoinPackage[];
  campaignMinBudget: number;
  campaignMaxBudget: number;
  maxActiveCampaignsPerUser: number;
  rewardRates: { subscriber: number; like: number };
  newUserBonusCoins: number;
  fraudThresholdReview: number;
  fraudThresholdBlock: number;
  maintenanceMode: boolean;
}
