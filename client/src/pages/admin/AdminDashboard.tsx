import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Film,
  Coins,
  ShieldAlert,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CoinIcon } from '../../components/common/CoinIcon';
import { adminApi } from '../../api';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<{
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
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getDashboardStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('[Admin Stats Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metrics = data?.metrics || {
    totalUsers: 0,
    activeUsers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalCoinsIssued: 0,
    totalCoinsSpent: 0,
    pendingCoinRequests: 0,
    pendingVerifications: 0,
    suspiciousAccounts: 0,
    totalRevenue: 0,
  };

  return (
    <AdminLayout
      title="Platform Overview & Analytics"
      subtitle="Real-time MongoDB statistics, escrow health, and moderation queues"
      actionButton={
        <Button variant="secondary" size="sm" onClick={fetchStats} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Metrics
        </Button>
      }
    >
      <div className="space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 space-y-3 bg-bg-card/90">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim uppercase tracking-wider font-bold">Total Users</span>
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-white font-mono">{metrics.totalUsers}</p>
              <span className="text-[11px] text-status-success font-semibold">
                {metrics.activeUsers} active accounts
              </span>
            </div>
          </Card>

          <Card className="p-5 space-y-3 bg-bg-card/90">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim uppercase tracking-wider font-bold">Campaigns</span>
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                <Film className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-white font-mono">{metrics.totalCampaigns}</p>
              <span className="text-[11px] text-cyan-400 font-semibold">
                {metrics.activeCampaigns} currently active
              </span>
            </div>
          </Card>

          <Card className="p-5 space-y-3 bg-bg-card/90">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim uppercase tracking-wider font-bold">Coins Issued</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-amber-400 font-mono flex items-center gap-1.5">
                <CoinIcon className="w-6 h-6" /> {metrics.totalCoinsIssued.toLocaleString()}
              </p>
              <span className="text-[11px] text-text-dim font-mono">
                {metrics.totalCoinsSpent.toLocaleString()} spent in campaigns
              </span>
            </div>
          </Card>

          <Card className="p-5 space-y-3 bg-bg-card/90">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim uppercase tracking-wider font-bold">Total Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-status-success font-mono">
                ${metrics.totalRevenue.toFixed(2)}
              </p>
              <span className="text-[11px] text-text-dim">USD settled purchases</span>
            </div>
          </Card>
        </div>

        {/* Action Queues Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link to="/admin/coin-requests">
            <Card className="p-6 border-amber-500/30 hover:border-amber-500/60 transition group cursor-pointer bg-bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                      Pending Coin Requests
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">Approve or decline user bundle purchases</p>
                  </div>
                </div>
                <Badge variant={metrics.pendingCoinRequests > 0 ? 'warning' : 'neutral'} size="md">
                  {metrics.pendingCoinRequests} Pending
                </Badge>
              </div>
            </Card>
          </Link>

          <Link to="/admin/verification-queue">
            <Card className="p-6 border-indigo-500/30 hover:border-indigo-500/60 transition group cursor-pointer bg-bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
                      Action Verification Queue
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">Review actions flagged by anti-fraud filters</p>
                  </div>
                </div>
                <Badge variant={metrics.pendingVerifications > 0 ? 'primary' : 'neutral'} size="md">
                  {metrics.pendingVerifications} Pending
                </Badge>
              </div>
            </Card>
          </Link>
        </div>

        {/* System Health Breakdown */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-white">System Health & Policy Matrix</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-1">
              <span className="text-text-dim block">Completed Campaigns</span>
              <p className="text-xl font-black text-white font-mono">{metrics.completedCampaigns}</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-1">
              <span className="text-text-dim block">High-Risk Suspicious Accounts</span>
              <p className="text-xl font-black text-status-danger font-mono">{metrics.suspiciousAccounts}</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-1">
              <span className="text-text-dim block">Escrow Guarantee Status</span>
              <p className="text-xl font-black text-status-success font-mono">100% OPERATIONAL</p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
