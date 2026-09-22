import React, { useEffect, useState } from 'react';
import { Film, Search, Pause, Play, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { YouTubeIcon } from '../../components/common/YouTubeIcon';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CoinIcon } from '../../components/common/CoinIcon';
import { adminApi } from '../../api';
import { Campaign } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCampaigns: React.FC = () => {
  const toast = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Moderation modal
  const [selectedCampaign, setSelectedCampaign] = useState<{
    campaign: Campaign;
    action: 'PAUSE' | 'RESUME' | 'CANCEL' | 'REJECT';
  } | null>(null);
  const [modReason, setModReason] = useState('');
  const [isModerating, setIsModerating] = useState(false);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCampaigns({
        page,
        limit: 15,
        search,
        status: statusFilter,
      });

      if (res.success) {
        setCampaigns(res.data.campaigns);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page, statusFilter]);

  const handleModerate = async () => {
    if (!selectedCampaign) return;
    const { campaign, action } = selectedCampaign;

    setIsModerating(true);
    try {
      const res = await adminApi.moderateCampaign(campaign._id, action, modReason);
      if (res.success) {
        toast.success(`Campaign ${action.toLowerCase()} completed`);
        setSelectedCampaign(null);
        setModReason('');
        fetchCampaigns();
      }
    } catch (err: any) {
      toast.error(err.message || 'Moderation action failed');
    } finally {
      setIsModerating(false);
    }
  };

  return (
    <AdminLayout
      title="Campaign Moderation"
      subtitle="Inspect video content, pause active campaigns, cancel & refund escrow budgets"
      actionButton={
        <Button variant="secondary" size="sm" onClick={fetchCampaigns} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchCampaigns();
            }}
            className="relative w-full sm:max-w-md"
          >
            <input
              type="text"
              placeholder="Search by title or video ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
            />
            <Search className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['ALL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === s
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-card border border-border-subtle text-text-muted hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Table */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <Card className="p-12 text-center text-xs text-text-muted">No campaigns found.</Card>
        ) : (
          <div className="w-full overflow-x-auto rounded-2xl border border-border-subtle bg-bg-card shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle bg-bg-primary/50 text-text-dim uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Campaign / Video</th>
                  <th className="py-3.5 px-4">Creator</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Escrow Reserved</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-main font-medium">
                {campaigns.map((camp) => {
                  const creator = typeof camp.creatorId === 'object' ? camp.creatorId : { name: 'Unknown', email: '' };
                  return (
                    <tr key={camp._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={camp.thumbnailUrl}
                            alt=""
                            className="w-14 h-9 rounded-lg object-cover bg-slate-800 shrink-0"
                          />
                          <div className="max-w-xs truncate">
                            <p className="font-bold text-white truncate">{camp.title}</p>
                            <a
                              href={camp.youtubeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-accent-secondary hover:underline flex items-center gap-1"
                            >
                              <YouTubeIcon className="w-3 h-3 text-rose-500" /> Watch Video
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-semibold text-white">{creator.name}</p>
                        <p className="text-[11px] text-text-dim">{creator.email}</p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {camp.type === 'SUBSCRIBER' ? (
                          <Badge variant="primary" size="sm">Subscribers</Badge>
                        ) : (
                          <Badge variant="cyan" size="sm">Likes</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold whitespace-nowrap">
                        {camp.completedQuantity} / {camp.targetQuantity}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {camp.reservedCoins} Coins
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge
                          variant={camp.status === 'ACTIVE' ? 'success' : camp.status === 'PAUSED' ? 'warning' : 'neutral'}
                        >
                          {camp.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {camp.status === 'ACTIVE' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedCampaign({ campaign: camp, action: 'PAUSE' })}
                            >
                              Pause
                            </Button>
                          )}
                          {camp.status === 'PAUSED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setSelectedCampaign({ campaign: camp, action: 'RESUME' })}
                            >
                              Resume
                            </Button>
                          )}
                          {camp.status !== 'COMPLETED' && camp.status !== 'CANCELLED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-status-danger hover:bg-rose-500/10"
                              onClick={() => setSelectedCampaign({ campaign: camp, action: 'CANCEL' })}
                            >
                              Force Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Confirmation Modal */}
        {selectedCampaign && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedCampaign(null)}
            title={`Confirm Campaign Moderation (${selectedCampaign.action})`}
            maxWidth="sm"
          >
            <div className="space-y-4">
              <p className="text-xs text-text-muted leading-relaxed">
                Action target: <strong className="text-white">{selectedCampaign.campaign.title}</strong>
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main">Reason for Audit Log</label>
                <input
                  type="text"
                  placeholder="e.g. Creator request, inappropriate metadata, or rule review"
                  value={modReason}
                  onChange={(e) => setModReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(null)}>
                  Cancel
                </Button>
                <Button
                  variant={selectedCampaign.action === 'CANCEL' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={handleModerate}
                  isLoading={isModerating}
                >
                  Execute {selectedCampaign.action}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};
