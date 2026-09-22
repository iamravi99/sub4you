import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CoinIcon } from '../../components/common/CoinIcon';
import { adminApi } from '../../api';
import { VerificationRecord } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminVerification: React.FC = () => {
  const toast = useToast();

  const [queue, setQueue] = useState<VerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getVerificationQueue();
      if (res.success) {
        setQueue(res.data.queue);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch verification queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleExecuteVerification = async () => {
    if (!selectedRecord) return;

    setIsProcessing(true);
    try {
      if (actionType === 'APPROVE') {
        const res = await adminApi.approveVerification(selectedRecord._id, reviewNotes);
        if (res.success) {
          toast.success(res.message || 'Verification approved and reward released!');
        }
      } else {
        const res = await adminApi.rejectVerification(selectedRecord._id, reviewNotes);
        if (res.success) {
          toast.info(res.message || 'Verification rejected.');
        }
      }
      setSelectedRecord(null);
      setReviewNotes('');
      fetchQueue();
    } catch (err: any) {
      toast.error(err.message || 'Failed to process verification');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout
      title="Action Verification Queue"
      subtitle="Moderation queue for user actions flagged for manual review with risk breakdown"
      actionButton={
        <Button variant="secondary" size="sm" onClick={fetchQueue} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Queue
        </Button>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading verification queue...</div>
        ) : queue.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-bg-primary border border-border-subtle mx-auto flex items-center justify-center text-status-success">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Verification Queue is Empty</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              All campaign actions have been processed or automatically verified by the anti-fraud scoring pipeline.
            </p>
          </Card>
        ) : (
          <div className="w-full overflow-x-auto rounded-2xl border border-border-subtle bg-bg-card shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle bg-bg-primary/50 text-text-dim uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Target Campaign</th>
                  <th className="py-3.5 px-4">YouTube Account</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Reward</th>
                  <th className="py-3.5 px-4 text-right">Moderator Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-main font-medium">
                {queue.map((rec) => (
                  <tr key={rec._id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-bold text-white">{rec.userId?.name || 'User'}</p>
                      <p className="text-[11px] text-text-dim">{rec.userId?.email}</p>
                    </td>
                    <td className="py-4 px-4 max-w-xs truncate whitespace-nowrap">
                      <p className="font-semibold text-white truncate">{rec.campaignId?.title}</p>
                      <span className="text-[10px] text-accent-secondary uppercase font-bold">
                        {rec.campaignId?.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-text-muted">
                      {rec.youtubeAccount || 'Not provided'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`font-mono font-bold ${
                        rec.riskScore > 70 ? 'text-status-danger' : rec.riskScore > 30 ? 'text-status-warning' : 'text-status-success'
                      }`}>
                        {rec.riskScore} / 100
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      +{rec.campaignId?.costPerAction || 1} Coin
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(rec);
                            setActionType('APPROVE');
                          }}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-status-danger hover:bg-rose-500/10"
                          onClick={() => {
                            setSelectedRecord(rec);
                            setActionType('REJECT');
                          }}
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {selectedRecord && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedRecord(null)}
            title={actionType === 'APPROVE' ? 'Approve Action & Release Reward' : 'Reject Action'}
            maxWidth="sm"
          >
            <div className="space-y-4">
              <p className="text-xs text-text-muted leading-relaxed">
                {actionType === 'APPROVE' ? (
                  <>
                    Approve verified participation for <strong className="text-white">{selectedRecord.userId?.name}</strong> on <strong className="text-white">"{selectedRecord.campaignId?.title}"</strong> and transfer <strong className="text-amber-400 font-mono">+{selectedRecord.campaignId?.costPerAction || 1} Coin</strong> from campaign escrow.
                  </>
                ) : (
                  <>
                    Reject participation attempt for <strong className="text-white">{selectedRecord.userId?.name}</strong>.
                  </>
                )}
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main">Moderator Review Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Verified manual subscriber check / Bot behavior detected"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)}>
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'APPROVE' ? 'primary' : 'danger'}
                  size="sm"
                  onClick={handleExecuteVerification}
                  isLoading={isProcessing}
                >
                  Confirm {actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};
