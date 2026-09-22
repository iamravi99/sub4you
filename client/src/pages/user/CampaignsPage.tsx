import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  Pause,
  Play,
  XCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Coins,
} from 'lucide-react';
import { YouTubeIcon } from '../../components/common/YouTubeIcon';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CoinIcon } from '../../components/common/CoinIcon';
import { Modal } from '../../components/common/Modal';
import { campaignsApi } from '../../api';
import { Campaign } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CampaignsPage: React.FC = () => {
  const { refreshUserProfile } = useAuth();
  const toast = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Action Confirmation Modal
  const [activeModalCampaign, setActiveModalCampaign] = useState<{
    campaign: Campaign;
    action: 'PAUSE' | 'RESUME' | 'CANCEL';
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await campaignsApi.getMyCampaigns(selectedStatus);
      if (res.success) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedStatus]);

  const handleExecuteStatusAction = async () => {
    if (!activeModalCampaign) return;
    const { campaign, action } = activeModalCampaign;

    setIsProcessingAction(true);
    try {
      const res = await campaignsApi.updateCampaignStatus(campaign._id, action);
      if (res.success) {
        toast.success(res.message || `Campaign ${action.toLowerCase()}d successfully`);
        await refreshUserProfile();
        fetchCampaigns();
        setActiveModalCampaign(null);
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action.toLowerCase()} campaign`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'PAUSED':
        return <Badge variant="warning">Paused</Badge>;
      case 'COMPLETED':
        return <Badge variant="primary">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-secondary mb-1">
            <Layers className="w-4 h-4" /> Creator Campaigns
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            Manage Your Campaigns
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Track engagement progress, monitor remaining escrow, and manage live campaign statuses.
          </p>
        </div>

        <Link to="/campaigns/create">
          <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Launch New Campaign
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-4 overflow-x-auto scrollbar-none">
        {['ALL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedStatus(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatus === tab
                ? 'bg-accent-primary text-white shadow-glow-primary'
                : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'ALL' ? 'All Campaigns' : tab}
          </button>
        ))}
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 rounded-2xl bg-bg-card animate-pulse border border-border-subtle" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-bg-primary border border-border-subtle mx-auto flex items-center justify-center text-text-dim">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No campaigns found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            You don't have any {selectedStatus !== 'ALL' ? selectedStatus.toLowerCase() : ''} campaigns created yet.
          </p>
          <Link to="/campaigns/create">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create Campaign Now
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((camp) => {
            const percent = Math.min(
              100,
              Math.round((camp.completedQuantity / camp.targetQuantity) * 100)
            );
            return (
              <Card key={camp._id} className="p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Video Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={camp.thumbnailUrl}
                      alt=""
                      className="w-24 sm:w-28 aspect-video rounded-xl object-cover bg-slate-800 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {camp.type === 'SUBSCRIBER' ? (
                          <Badge variant="primary" size="sm">Subscribers</Badge>
                        ) : (
                          <Badge variant="cyan" size="sm">Likes</Badge>
                        )}
                        {getStatusBadge(camp.status)}
                      </div>
                      <h3 className="text-sm font-bold text-white truncate max-w-lg">{camp.title}</h3>
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <YouTubeIcon className="w-3.5 h-3.5 text-rose-500" />
                        <span className="truncate">{camp.youtubeChannelTitle || 'Your Channel'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Controls */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {camp.status === 'ACTIVE' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveModalCampaign({ campaign: camp, action: 'PAUSE' })}
                        leftIcon={<Pause className="w-3.5 h-3.5" />}
                      >
                        Pause
                      </Button>
                    )}

                    {camp.status === 'PAUSED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveModalCampaign({ campaign: camp, action: 'RESUME' })}
                        leftIcon={<Play className="w-3.5 h-3.5" />}
                      >
                        Resume
                      </Button>
                    )}

                    {camp.status !== 'COMPLETED' && camp.status !== 'CANCELLED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-status-danger hover:bg-rose-500/10"
                        onClick={() => setActiveModalCampaign({ campaign: camp, action: 'CANCEL' })}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Cancel & Refund
                      </Button>
                    )}
                  </div>
                </div>

                {/* Metrics & Progress Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border-subtle text-xs">
                  <div>
                    <span className="text-text-dim block">Progress</span>
                    <span className="font-bold text-white font-mono">
                      {camp.completedQuantity} / {camp.targetQuantity} ({percent}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-text-dim block">Escrow Remaining</span>
                    <span className="font-bold text-amber-400 font-mono flex items-center gap-1">
                      <CoinIcon className="w-3 h-3" /> {camp.reservedCoins} Coins
                    </span>
                  </div>
                  <div>
                    <span className="text-text-dim block">Spent Coins</span>
                    <span className="font-bold text-text-main font-mono">{camp.spentCoins} Coins</span>
                  </div>
                  <div>
                    <span className="text-text-dim block">Created Date</span>
                    <span className="text-text-dim">{new Date(camp.createdAt).toLocaleDateString()}</span>
                  </div>
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

      {/* Confirmation Modal */}
      {activeModalCampaign && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModalCampaign(null)}
          title={`Confirm ${activeModalCampaign.action === 'CANCEL' ? 'Cancellation' : activeModalCampaign.action}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-text-muted leading-relaxed">
              {activeModalCampaign.action === 'CANCEL' ? (
                <>
                  Are you sure you want to cancel this campaign? Any remaining{' '}
                  <strong className="text-amber-400 font-mono">{activeModalCampaign.campaign.reservedCoins} unspent escrow coins</strong> will be immediately refunded back to your available balance.
                </>
              ) : activeModalCampaign.action === 'PAUSE' ? (
                'Pausing this campaign will temporarily hide it from the public discovery feed.'
              ) : (
                'Resuming will make this campaign visible again on the active discovery stream.'
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button variant="ghost" size="sm" onClick={() => setActiveModalCampaign(null)}>
                Go Back
              </Button>
              <Button
                variant={activeModalCampaign.action === 'CANCEL' ? 'danger' : 'primary'}
                size="sm"
                onClick={handleExecuteStatusAction}
                isLoading={isProcessingAction}
              >
                Confirm {activeModalCampaign.action}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
