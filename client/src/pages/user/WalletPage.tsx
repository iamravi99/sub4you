import React, { useEffect, useState } from 'react';
import { Wallet, History, Coins, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { CoinBalanceCard } from '../../components/wallet/CoinBalanceCard';
import { TransactionTable } from '../../components/wallet/TransactionTable';
import { PurchaseModal } from '../../components/wallet/PurchaseModal';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { walletApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { CoinTransaction, CoinPurchaseRequest, CoinPackage } from '../../types';
import { DEFAULT_COIN_PACKAGES } from '../../../../server/src/constants';

export const WalletPage: React.FC = () => {
  const { userProfile, coins, reservedCoins, refreshUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'PURCHASE_REQUESTS'>('TRANSACTIONS');
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<CoinPurchaseRequest[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>(DEFAULT_COIN_PACKAGES);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      const [walletRes, txRes, reqsRes] = await Promise.all([
        walletApi.getWalletOverview(),
        walletApi.getTransactions(page, 20),
        walletApi.getMyPurchaseRequests(),
      ]);

      if (walletRes.success) {
        if (walletRes.data.packages?.length) setPackages(walletRes.data.packages);
      }
      if (txRes.success) {
        setTransactions(txRes.data.transactions);
        setTotalPages(txRes.data.pagination.pages);
      }
      if (reqsRes.success) {
        setPurchaseRequests(reqsRes.data.requests);
      }
    } catch (err) {
      console.error('[Wallet Load Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [page]);

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Wallet className="w-4 h-4" /> Coin Ledger & Escrow
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            Creator Wallet
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Complete auditable balance, escrow reservations, transaction histories, and coin requests.
          </p>
        </div>
      </div>

      {/* Main Balance Card */}
      <CoinBalanceCard
        coins={coins}
        reservedCoins={reservedCoins}
        totalEarned={userProfile?.totalEarned || 0}
        totalSpent={userProfile?.totalSpent || 0}
        onOpenBuyModal={() => setIsBuyModalOpen(true)}
      />

      {/* History Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('TRANSACTIONS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'TRANSACTIONS'
                  ? 'bg-accent-primary text-white shadow-glow-primary'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4" /> Transactions Ledger
            </button>
            <button
              onClick={() => setActiveTab('PURCHASE_REQUESTS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'PURCHASE_REQUESTS'
                  ? 'bg-accent-primary text-white shadow-glow-primary'
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Coins className="w-4 h-4" /> Purchase Requests ({purchaseRequests.length})
            </button>
          </div>
        </div>

        {activeTab === 'TRANSACTIONS' ? (
          <div className="space-y-4">
            <TransactionTable transactions={transactions} isLoading={isLoading} />
          </div>
        ) : (
          <div className="space-y-4">
            {purchaseRequests.length === 0 ? (
              <Card className="p-8 text-center text-xs text-text-muted">
                No coin purchase requests submitted yet.
              </Card>
            ) : (
              <div className="w-full overflow-x-auto rounded-2xl border border-border-subtle bg-bg-card shadow-card">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border-subtle bg-bg-primary/50 text-text-dim uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Request ID</th>
                      <th className="py-3.5 px-4">Coin Bundle</th>
                      <th className="py-3.5 px-4">Price (USD)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Admin Notes</th>
                      <th className="py-3.5 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-text-main font-medium">
                    {purchaseRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                          {req.requestId}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                          {req.coinAmount.toLocaleString()} Coins
                        </td>
                        <td className="py-4 px-4 font-mono whitespace-nowrap">
                          ${req.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {getRequestStatusBadge(req.status)}
                        </td>
                        <td className="py-4 px-4 text-text-muted max-w-xs truncate">
                          {req.adminNotes || '—'}
                        </td>
                        <td className="py-4 px-4 text-right text-text-dim text-[11px] whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buy Modal */}
      <PurchaseModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        packages={packages}
        onRequestSubmitted={() => {
          refreshUserProfile();
          loadWalletData();
        }}
      />
    </div>
  );
};
