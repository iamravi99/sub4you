import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  PlusCircle,
  Compass,
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CoinIcon } from '../../components/common/CoinIcon';
import { PurchaseModal } from '../../components/wallet/PurchaseModal';
import { userApi, walletApi, campaignsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { CoinTransaction, Campaign, CoinPackage } from '../../types';
import { DEFAULT_COIN_PACKAGES } from '../../constants';

export const DashboardPage: React.FC = () => {
  const { userProfile, coins, reservedCoins, refreshUserProfile } = useAuth();

  const [stats, setStats] = useState<{
    activeCampaigns: number;
    totalCampaigns: number;
    verifiedActions: number;
    successRate: number;
  }>({
    activeCampaigns: 0,
    totalCampaigns: 0,
    verifiedActions: 0,
    successRate: 100,
  });

  const [recentTransactions, setRecentTransactions] = useState<CoinTransaction[]>([]);
  const [activeCampaignsList, setActiveCampaignsList] = useState<Campaign[]>([]);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [packages, setPackages] = useState<CoinPackage[]>(DEFAULT_COIN_PACKAGES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [profileRes, walletRes, myCampRes] = await Promise.all([
          userApi.getMyProfile(),
          walletApi.getWalletOverview(),
          campaignsApi.getMyCampaigns('ACTIVE'),
        ]);

        if (profileRes.success) {
          setStats(profileRes.data.stats);
        }
        if (walletRes.success) {
          setRecentTransactions(walletRes.data.recentTransactions);
          if (walletRes.data.packages?.length) setPackages(walletRes.data.packages);
        }
        if (myCampRes.success) {
          setActiveCampaignsList(myCampRes.data.campaigns.slice(0, 3));
        }
      } catch (err) {
        console.error('[Dashboard Load Error]', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
              Welcome, {userProfile?.name || 'Creator'}
            </h1>
            <Badge variant="primary" size="sm">
              Creator Pro
            </Badge>
          </div>
          <p className="text-xs text-text-muted">
            Manage your channel campaigns, monitor escrow ledger, and discover opportunities to earn coins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsBuyModalOpen(true)}
            leftIcon={<CoinIcon className="w-4 h-4" />}
          >
            Buy Coins
          </Button>
          <Link to="/campaigns/create">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Coin Card */}
        <div className="lg:col-span-2 rounded-3xl border border-border-strong bg-gradient-to-br from-bg-card via-bg-cardHover to-bg-primary p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-text-dim font-bold">Your Available Balance</span>
              <span className="text-xs font-semibold text-status-success flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for deployment
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <CoinIcon className="w-10 h-10 sm:w-12 sm:h-12" />
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {coins.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono">
                COINS
              </span>
            </div>
            {reservedCoins > 0 && (
              <p className="text-xs text-amber-400 flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{reservedCoins.toLocaleString()} coins reserved in active campaign escrow</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-border-subtle text-xs">
            <div className="p-3 rounded-xl bg-bg-primary/80 border border-border-subtle">
              <span className="text-[11px] text-text-dim block">Lifetime Earned</span>
              <span className="font-bold text-status-success font-mono text-sm mt-0.5 block">
                +{userProfile?.totalEarned || 0} Coins
              </span>
            </div>
            <div className="p-3 rounded-xl bg-bg-primary/80 border border-border-subtle">
              <span className="text-[11px] text-text-dim block">Lifetime Spent</span>
              <span className="font-bold text-accent-secondary font-mono text-sm mt-0.5 block">
                -{userProfile?.totalSpent || 0} Coins
              </span>
            </div>
            <div className="p-3 rounded-xl bg-bg-primary/80 border border-border-subtle">
              <span className="text-[11px] text-text-dim block">Active Campaigns</span>
              <span className="font-bold text-white font-mono text-sm mt-0.5 block">
                {stats.activeCampaigns}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-bg-primary/80 border border-border-subtle">
              <span className="text-[11px] text-text-dim block">Actions Completed</span>
              <span className="font-bold text-indigo-400 font-mono text-sm mt-0.5 block">
                {stats.verifiedActions}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Discovery Promo */}
        <Card className="p-6 flex flex-col justify-between space-y-4 bg-bg-card/80">
          <div className="space-y-2">
            <Badge variant="cyan">Quick Growth Actions</Badge>
            <h3 className="text-lg font-bold text-white">Need More Coins?</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Earn free coins by engaging with fellow YouTube creators in the discovery stream.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link to="/discover">
              <Button variant="secondary" size="md" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-accent-secondary" /> Discover Campaigns
                </span>
              </Button>
            </Link>
            <Link to="/campaigns/create">
              <Button variant="outline" size="md" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-accent-primary" /> Launch New Campaign
                </span>
              </Button>
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-bg-primary border border-border-subtle flex items-center gap-3 text-xs text-text-dim">
            <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
            <span>Anti-fraud protected escrow transactions</span>
          </div>
        </Card>
      </div>

      {/* Active Creator Campaigns & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Active Campaigns */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-primary" /> Your Active Campaigns
            </h3>
            <Link to="/campaigns" className="text-xs font-semibold text-accent-primary hover:underline">
              View all
            </Link>
          </div>

          {activeCampaignsList.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <p className="text-xs text-text-muted">You have no active campaigns running right now.</p>
              <Link to="/campaigns/create">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Create Your First Campaign
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeCampaignsList.map((camp) => {
                const percent = Math.min(100, Math.round((camp.completedQuantity / camp.targetQuantity) * 100));
                return (
                  <Card key={camp._id} className="p-4 space-y-3 hover:border-border-strong transition">
                    <div className="flex items-center gap-3">
                      <img
                        src={camp.thumbnailUrl}
                        alt=""
                        className="w-16 h-11 rounded-lg object-cover bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{camp.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] uppercase font-bold text-accent-secondary">
                            {camp.type}
                          </span>
                          <span className="text-[10px] text-text-dim font-mono">
                            {camp.completedQuantity} / {camp.targetQuantity} ({percent}%)
                          </span>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">Active</Badge>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Coin Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" /> Recent Coin Activity
            </h3>
            <Link to="/wallet" className="text-xs font-semibold text-accent-primary hover:underline">
              View full ledger
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <Card className="p-8 text-center text-xs text-text-muted">
              No recent transactions recorded yet.
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden divide-y divide-border-subtle">
              {recentTransactions.slice(0, 5).map((tx) => {
                const isPos = tx.amount > 0;
                return (
                  <div key={tx._id} className="p-4 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isPos ? 'bg-status-success/15 text-status-success' : 'bg-status-danger/15 text-status-danger'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{tx.description}</p>
                        <p className="text-[11px] text-text-dim">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-bold shrink-0 ${isPos ? 'text-status-success' : 'text-status-danger'}`}>
                      {isPos ? '+' : ''}{tx.amount} Coins
                    </span>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      <PurchaseModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        packages={packages}
        onRequestSubmitted={refreshUserProfile}
      />
    </div>
  );
};
