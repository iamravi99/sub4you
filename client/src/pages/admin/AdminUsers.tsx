import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, Ban, CheckCircle2, Coins, Edit, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CoinIcon } from '../../components/common/CoinIcon';
import { adminApi } from '../../api';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedUserForCoins, setSelectedUserForCoins] = useState<User | null>(null);
  const [coinAdjustmentAmount, setCoinAdjustmentAmount] = useState<number>(100);
  const [coinAdjustmentReason, setCoinAdjustmentReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const [selectedUserForStatus, setSelectedUserForStatus] = useState<User | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers({
        page,
        limit: 15,
        search,
        status: statusFilter,
      });

      if (res.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch user list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCoins || !coinAdjustmentReason) {
      toast.warning('Please enter an administrative reason');
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await adminApi.adjustUserCoins(
        selectedUserForCoins._id,
        coinAdjustmentAmount,
        coinAdjustmentReason
      );

      if (res.success) {
        toast.success(`Successfully adjusted coins for ${selectedUserForCoins.name}`);
        setSelectedUserForCoins(null);
        setCoinAdjustmentReason('');
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to adjust coins');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'active' | 'suspended' | 'flagged') => {
    if (!selectedUserForStatus) return;

    setIsUpdatingStatus(true);
    try {
      const res = await adminApi.updateUserStatus(
        selectedUserForStatus._id,
        newStatus,
        statusReason || 'Administrative update'
      );

      if (res.success) {
        toast.success(`User status changed to ${newStatus}`);
        setSelectedUserForStatus(null);
        setStatusReason('');
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <AdminLayout
      title="User Directory & Management"
      subtitle="Search creators, audit balances, adjust coins, and moderate account states"
      actionButton={
        <Button variant="secondary" size="sm" onClick={fetchUsers} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search by name, email, username, or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-primary"
            />
            <Search className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {['ALL', 'active', 'suspended', 'flagged'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
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

        {/* Users Table */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading users...</div>
        ) : users.length === 0 ? (
          <Card className="p-12 text-center text-xs text-text-muted">No users found.</Card>
        ) : (
          <div className="w-full overflow-x-auto rounded-2xl border border-border-subtle bg-bg-card shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle bg-bg-primary/50 text-text-dim uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Creator / Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Coins Balance</th>
                  <th className="py-3.5 px-4">Campaigns</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-main font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                        />
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[11px] text-text-dim">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-text-dim'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {u.coins.toLocaleString()} Coins
                    </td>
                    <td className="py-4 px-4 font-mono text-white whitespace-nowrap">
                      {u.campaignsCreated || 0}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`font-mono font-bold ${
                        u.riskScore > 70 ? 'text-status-danger' : u.riskScore > 30 ? 'text-status-warning' : 'text-status-success'
                      }`}>
                        {u.riskScore || 0} / 100
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge variant={u.status === 'active' ? 'success' : u.status === 'suspended' ? 'danger' : 'warning'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedUserForCoins(u)}
                          leftIcon={<Coins className="w-3.5 h-3.5 text-amber-400" />}
                        >
                          Coins
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUserForStatus(u)}
                        >
                          Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Coin Adjustment Modal */}
        {selectedUserForCoins && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedUserForCoins(null)}
            title={`Adjust Coins for ${selectedUserForCoins.name}`}
            maxWidth="md"
          >
            <form onSubmit={handleAdjustCoins} className="space-y-4">
              <p className="text-xs text-text-muted">
                Current Balance: <strong className="text-white font-mono">{selectedUserForCoins.coins} Coins</strong>. Enter a positive number to credit, or negative to deduct.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main">Coin Adjustment Amount</label>
                <input
                  type="number"
                  required
                  value={coinAdjustmentAmount}
                  onChange={(e) => setCoinAdjustmentAmount(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main">Administrative Audit Reason (Required)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Promo Grant, Manual Refund, Policy Correction"
                  value={coinAdjustmentReason}
                  onChange={(e) => setCoinAdjustmentReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedUserForCoins(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isAdjusting}>
                  Save Adjustment
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Status Modification Modal */}
        {selectedUserForStatus && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedUserForStatus(null)}
            title={`Change Status for ${selectedUserForStatus.name}`}
            maxWidth="sm"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main">Audit Reason / Notice</label>
                <input
                  type="text"
                  placeholder="e.g. Terms violation or requested account review"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus('active')}
                  isLoading={isUpdatingStatus}
                >
                  Activate Account
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('flagged')}
                  isLoading={isUpdatingStatus}
                >
                  Flag for Review
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleUpdateStatus('suspended')}
                  isLoading={isUpdatingStatus}
                >
                  Suspend Account
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};
