import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Shield, Gift, PlusCircle, RefreshCw } from 'lucide-react';
import { CoinTransaction } from '../../types';
import { CoinIcon } from '../common/CoinIcon';
import { Badge } from '../common/Badge';

interface TransactionTableProps {
  transactions: CoinTransaction[];
  isLoading?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-accent-primary" />
        Loading transaction ledger...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-text-muted rounded-2xl border border-border-subtle bg-bg-card">
        No transaction history recorded yet.
      </div>
    );
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <Badge variant="warning">Coin Purchase</Badge>;
      case 'ACTION_REWARD':
        return <Badge variant="success">Action Reward</Badge>;
      case 'CAMPAIGN_RESERVE':
        return <Badge variant="primary">Campaign Escrow</Badge>;
      case 'CAMPAIGN_REFUND':
        return <Badge variant="cyan">Escrow Refund</Badge>;
      case 'NEW_USER_BONUS':
        return <Badge variant="purple">Welcome Bonus</Badge>;
      case 'ADMIN_ADJUSTMENT':
        return <Badge variant="neutral">Admin Adjustment</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border-subtle bg-bg-card shadow-card">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border-subtle bg-bg-primary/50 text-text-dim uppercase tracking-wider font-semibold">
          <tr>
            <th className="py-3.5 px-4">Transaction / Type</th>
            <th className="py-3.5 px-4">Description</th>
            <th className="py-3.5 px-4 text-right">Amount</th>
            <th className="py-3.5 px-4 text-right">Balance After</th>
            <th className="py-3.5 px-4 text-right">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle text-text-main font-medium">
          {transactions.map((tx) => {
            const isPositive = tx.amount > 0;
            return (
              <tr key={tx._id} className="hover:bg-white/[0.02] transition">
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isPositive ? 'bg-status-success/15 text-status-success' : 'bg-status-danger/15 text-status-danger'
                      }`}
                    >
                      {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    {getTypeBadge(tx.type)}
                  </div>
                </td>
                <td className="py-4 px-4 max-w-xs truncate text-text-muted">
                  {tx.description}
                </td>
                <td className={`py-4 px-4 text-right font-mono font-bold whitespace-nowrap ${isPositive ? 'text-status-success' : 'text-status-danger'}`}>
                  {isPositive ? '+' : ''}{tx.amount} Coins
                </td>
                <td className="py-4 px-4 text-right font-mono text-white whitespace-nowrap">
                  {tx.balanceAfter.toLocaleString()} Coins
                </td>
                <td className="py-4 px-4 text-right text-text-dim text-[11px] whitespace-nowrap">
                  {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
