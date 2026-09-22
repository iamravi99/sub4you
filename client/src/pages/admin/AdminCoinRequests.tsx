import React, { useEffect, useState } from 'react';
import { Coins, CheckCircle2, XCircle, Search, Clock, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CoinIcon } from '../../components/common/CoinIcon';
import { adminApi } from '../../api';
import { CoinPurchaseRequest } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCoinRequests: React.FC = () => {
  const toast = useToast();

  const [requests, setRequests] = useState<CoinPurchaseRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Approve / Reject Modals
  const [selectedReq, setSelectedReq] = useState<CoinPurchaseRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCoinRequests({
        page,
        limit: 15,
        status: statusFilter,
      });

      if (res.success) {
        setRequests(res.data.requests);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch coin requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleExecuteAction = async () => {
    if (!selectedReq) return;

    setIsProcessing(true);
    try {
      if (actionType === 'APPROVE') {
        const res = await adminApi.approveCoinRequest(selectedReq._id, adminNotes);
        if (res.success) {
          toast.success(res.message || 'Coin purchase approved and credited!');
        }
      } else {
        const res = await adminApi.rejectCoinRequest(selectedReq._id, adminNotes);
        if (res.success) {
          toast.info('Coin purchase request declined.');
        }
      }
      setSelectedReq(null);
      setAdminNotes('');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout
      title="Coin Purchase Requests"
      subtitle="Review pending user coin package purchases and credit balances via the ledger"
      actionButton={
        <Button variant="secondary" size="sm" onClick={fetchRequests} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition capitalize ${
                statusFilter === s
                  ? 'bg-accent-primary text-white shadow-glow-primary'
                  : 'bg-bg-card border border-border-subtle text-text-muted hover:text-white'
              }`}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Requests Table */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading purchase requests...</div>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center text-xs text-text-muted">
            No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} coin purchase requests found.
          </Card>
        ) : (
          <div className="w-full overflow-x-auto rounded-2xl border border-border-subtle bg-bg-card shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle bg-bg-primary/50 text-text-dim uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">User / Creator</th>
                  <th className="py-3.5 px-4">Coins Requested</th>
                  <th className="py-3.5 px-4">Price (USD)</th>
                  <th className="py-3.5 px-4">Payment Notes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-main font-medium">
                {requests.map((req) => {
                  const user = typeof req.userId === 'object' ? req.userId : { name: 'User', email: '', coins: 0 };
                  return (
                    <tr key={req._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {req.requestId}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-[11px] text-text-dim">{user.email}</p>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <CoinIcon className="w-4 h-4" /> {req.coinAmount.toLocaleString()} Coins
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono whitespace-nowrap">
                        ${req.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-text-muted max-w-xs truncate">
                        {req.paymentNotes || '—'}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge
                          variant={req.status === 'APPROVED' ? 'success' : req.status === 'PENDING' ? 'warning' : 'danger'}
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedReq(req);
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
                                setSelectedReq(req);
                                setActionType('REJECT');
                              }}
                              leftIcon={<XCircle className="w-3.5 h-3.5" />}
                            >
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-text-dim">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Confirmation Modal */}
        {selectedReq && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedReq(null)}
            title={actionType === 'APPROVE' ? 'Approve Coin Purchase' : 'Decline Coin Purchase'}
            maxWidth="sm"
          >
            <div className="space-y-4">
              <p className="text-xs text-text-muted leading-relaxed">
                {actionType === 'APPROVE' ? (
                  <>
                    Are you sure you want to approve request <strong className="text-white font-mono">#{selectedReq.requestId}</strong>? This will atomically credit <strong className="text-amber-400 font-mono">{selectedReq.coinAmount.toLocaleString()} Coins</strong> to the user's wallet.
                  </>
                ) : (
                  <>
                    Decline purchase request <strong className="text-white font-mono">#{selectedReq.requestId}</strong>.
                  </>
                )}
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main">Admin Notes / Audit Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Payment verified via gateway or invalid payment proof"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <Button variant="ghost" size="sm" onClick={() => setSelectedReq(null)}>
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'APPROVE' ? 'primary' : 'danger'}
                  size="sm"
                  onClick={handleExecuteAction}
                  isLoading={isProcessing}
                >
                  Confirm {actionType === 'APPROVE' ? 'Approval' : 'Decline'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};
