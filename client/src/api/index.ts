import { apiClient } from './client';
import {
  User,
  Campaign,
  CoinTransaction,
  CoinPurchaseRequest,
  VerificationRecord,
  AppNotification,
  AuditLog,
  SystemSettings,
  CoinPackage,
} from '../types';

export const authApi = {
  syncUser: async (payload: { uid?: string; email: string; name?: string; avatar?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: { user: User; isNewUser: boolean }; message: string }>(
      '/auth/sync',
      payload
    );
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return res.data;
  },
};

export const userApi = {
  getMyProfile: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        user: User;
        stats: {
          activeCampaigns: number;
          totalCampaigns: number;
          verifiedActions: number;
          successRate: number;
        };
      };
    }>('/users/me');
    return res.data;
  },
  updateProfile: async (payload: { name?: string; bio?: string; avatar?: string; username?: string }) => {
    const res = await apiClient.patch<{ success: boolean; data: { user: User }; message: string }>(
      '/users/me',
      payload
    );
    return res.data;
  },
  getPublicProfile: async (username: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: { creator: User; campaigns: Campaign[] };
    }>(`/users/profile/${username}`);
    return res.data;
  },
};

export const walletApi = {
  getWalletOverview: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        coins: number;
        reservedCoins: number;
        totalEarned: number;
        totalSpent: number;
        packages: CoinPackage[];
        recentTransactions: CoinTransaction[];
      };
    }>('/wallet');
    return res.data;
  },
  getTransactions: async (page = 1, limit = 20) => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        transactions: CoinTransaction[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    }>(`/wallet/transactions?page=${page}&limit=${limit}`);
    return res.data;
  },
  createPurchaseRequest: async (payload: { packageId: string; paymentMethod?: string; paymentNotes?: string }) => {
    const res = await apiClient.post<{
      success: boolean;
      data: { purchaseRequest: CoinPurchaseRequest };
      message: string;
    }>('/wallet/purchase-request', payload);
    return res.data;
  },
  getMyPurchaseRequests: async () => {
    const res = await apiClient.get<{ success: boolean; data: { requests: CoinPurchaseRequest[] } }>(
      '/wallet/purchase-requests'
    );
    return res.data;
  },
};

export const campaignsApi = {
  getDiscoverCampaigns: async (params?: { type?: string; category?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'ALL') query.append('type', params.type);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await apiClient.get<{
      success: boolean;
      data: {
        campaigns: Campaign[];
        participatedCampaignIds: string[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    }>(`/campaigns?${query.toString()}`);
    return res.data;
  },
  validateYoutubeUrl: async (url: string) => {
    const res = await apiClient.post<{
      success: boolean;
      data: {
        videoId: string;
        title: string;
        description: string;
        thumbnailUrl: string;
        channelId: string;
        channelTitle: string;
      };
    }>('/campaigns/validate-url', { url });
    return res.data;
  },
  createCampaign: async (payload: {
    title: string;
    description?: string;
    youtubeUrl: string;
    type: 'SUBSCRIBER' | 'LIKE';
    targetQuantity: number;
    category?: string;
    language?: string;
    targetAudience?: string;
  }) => {
    const res = await apiClient.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      '/campaigns',
      payload
    );
    return res.data;
  },
  getMyCampaigns: async (status = 'ALL') => {
    const res = await apiClient.get<{ success: boolean; data: { campaigns: Campaign[] } }>(
      `/campaigns/my?status=${status}`
    );
    return res.data;
  },
  getCampaignById: async (id: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: { campaign: Campaign; userParticipation?: any };
    }>(`/campaigns/${id}`);
    return res.data;
  },
  updateCampaignStatus: async (id: string, action: 'PAUSE' | 'RESUME' | 'CANCEL') => {
    const res = await apiClient.patch<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      `/campaigns/${id}/status`,
      { action }
    );
    return res.data;
  },
  participateCampaign: async (campaignId: string) => {
    const res = await apiClient.post<{
      success: boolean;
      data: { participation: any; campaign: Campaign };
      message: string;
    }>(`/campaigns/${campaignId}/participate`, { campaignId });
    return res.data;
  },
  verifyAction: async (campaignId: string, actionTimeSeconds = 30, youtubeAccount?: string) => {
    const res = await apiClient.post<{
      success: boolean;
      data: {
        status: string;
        rewardEarned: number;
        message: string;
        riskScore: number;
        participation: any;
      };
      message: string;
    }>(`/campaigns/${campaignId}/verify`, { campaignId, actionTimeSeconds, youtubeAccount });
    return res.data;
  },
};

export const notificationsApi = {
  getNotifications: async (page = 1, limit = 30) => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        notifications: AppNotification[];
        unreadCount: number;
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    }>(`/notifications?page=${page}&limit=${limit}`);
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; data: { notification: AppNotification } }>(
      `/notifications/${id}/read`
    );
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await apiClient.patch<{ success: boolean; message: string }>('/notifications/read-all');
    return res.data;
  },
};

export const adminApi = {
  getDashboardStats: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        metrics: {
          totalUsers: number;
          activeUsers: number;
          totalCampaigns: number;
          activeCampaigns: number;
          completedCampaigns: number;
          totalCoinsIssued: number;
          totalCoinsSpent: number;
          pendingCoinRequests: number;
          pendingVerifications: number;
          suspiciousAccounts: number;
          totalRevenue: number;
        };
        charts: {
          dailyCampaigns: Array<{ _id: string; count: number }>;
        };
      };
    }>('/admin/dashboard');
    return res.data;
  },
  getUsers: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    const res = await apiClient.get<{
      success: boolean;
      data: {
        users: User[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    }>(`/admin/users?${query.toString()}`);
    return res.data;
  },
  updateUserStatus: async (id: string, status: 'active' | 'suspended' | 'flagged', reason?: string) => {
    const res = await apiClient.patch<{ success: boolean; data: { user: User }; message: string }>(
      `/admin/users/${id}/status`,
      { status, reason }
    );
    return res.data;
  },
  adjustUserCoins: async (id: string, amount: number, reason: string) => {
    const res = await apiClient.post<{ success: boolean; data: { user: User; transaction: CoinTransaction }; message: string }>(
      `/admin/users/${id}/adjust-coins`,
      { amount, reason }
    );
    return res.data;
  },
  getCampaigns: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    const res = await apiClient.get<{
      success: boolean;
      data: {
        campaigns: Campaign[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    }>(`/admin/campaigns?${query.toString()}`);
    return res.data;
  },
  moderateCampaign: async (id: string, action: 'PAUSE' | 'RESUME' | 'CANCEL' | 'REJECT', reason?: string) => {
    const res = await apiClient.patch<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      `/admin/campaigns/${id}/moderate`,
      { action, reason }
    );
    return res.data;
  },
  getCoinRequests: async (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);

    const res = await apiClient.get<{
      success: boolean;
      data: {
        requests: CoinPurchaseRequest[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    }>(`/admin/coin-requests?${query.toString()}`);
    return res.data;
  },
  approveCoinRequest: async (id: string, adminNotes?: string) => {
    const res = await apiClient.post<{ success: boolean; data: { request: CoinPurchaseRequest }; message: string }>(
      `/admin/coin-requests/${id}/approve`,
      { adminNotes }
    );
    return res.data;
  },
  rejectCoinRequest: async (id: string, rejectionReason?: string) => {
    const res = await apiClient.post<{ success: boolean; data: { request: CoinPurchaseRequest }; message: string }>(
      `/admin/coin-requests/${id}/reject`,
      { rejectionReason }
    );
    return res.data;
  },
  getVerificationQueue: async () => {
    const res = await apiClient.get<{ success: boolean; data: { queue: VerificationRecord[] } }>(
      '/admin/verification-queue'
    );
    return res.data;
  },
  approveVerification: async (id: string, notes?: string) => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      `/admin/verifications/${id}/approve`,
      { notes }
    );
    return res.data;
  },
  rejectVerification: async (id: string, reason?: string) => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      `/admin/verifications/${id}/reject`,
      { reason }
    );
    return res.data;
  },
  getAuditLogs: async (page = 1, limit = 30) => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        logs: AuditLog[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    }>(`/admin/audit-logs?page=${page}&limit=${limit}`);
    return res.data;
  },
  getSettings: async () => {
    const res = await apiClient.get<{ success: boolean; data: { settings: SystemSettings } }>('/admin/settings');
    return res.data;
  },
  updateSettings: async (payload: Partial<SystemSettings>) => {
    const res = await apiClient.patch<{ success: boolean; data: { settings: SystemSettings }; message: string }>(
      '/admin/settings',
      payload
    );
    return res.data;
  },
};
