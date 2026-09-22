import React from 'react';
import { Coins, Lock, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';
import { CoinIcon } from '../common/CoinIcon';
import { Button } from '../common/Button';

interface CoinBalanceCardProps {
  coins: number;
  reservedCoins: number;
  totalEarned: number;
  totalSpent: number;
  onOpenBuyModal: () => void;
}

export const CoinBalanceCard: React.FC<CoinBalanceCardProps> = ({
  coins,
  reservedCoins,
  totalEarned,
  totalSpent,
  onOpenBuyModal,
}) => {
  return (
    <div className="rounded-3xl border border-border-strong bg-gradient-to-br from-bg-card via-bg-cardHover to-bg-primary p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Main Balance */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-text-dim font-bold">Total Available Balance</span>
            <span className="px-2 py-0.5 rounded-md bg-status-success/10 text-status-success text-[10px] font-bold">
              Ready for campaigns
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <CoinIcon className="w-10 h-10 sm:w-12 sm:h-12" />
            <h1 className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {coins.toLocaleString()}
            </h1>
            <span className="text-sm sm:text-base font-bold text-amber-400/90 uppercase tracking-wider">
              Coins
            </span>
          </div>
          {reservedCoins > 0 && (
            <p className="text-xs text-amber-400/80 flex items-center gap-1.5 pt-1">
              <Lock className="w-3.5 h-3.5" />
              <span>{reservedCoins.toLocaleString()} coins currently held in active campaign escrow</span>
            </p>
          )}
        </div>

        {/* Quick CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="gold"
            size="lg"
            onClick={onOpenBuyModal}
            leftIcon={<PlusCircle className="w-5 h-5" />}
          >
            Buy / Request Coins
          </Button>
        </div>
      </div>

      {/* Sub-Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border-subtle">
        <div className="p-3.5 rounded-2xl bg-bg-primary/60 border border-border-subtle">
          <span className="text-[11px] text-text-dim block">Available</span>
          <p className="text-base font-bold text-white font-mono mt-0.5">{coins.toLocaleString()}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-bg-primary/60 border border-border-subtle">
          <span className="text-[11px] text-text-dim flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400" /> In Escrow
          </span>
          <p className="text-base font-bold text-amber-400 font-mono mt-0.5">{reservedCoins.toLocaleString()}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-bg-primary/60 border border-border-subtle">
          <span className="text-[11px] text-text-dim flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-status-success" /> Lifetime Earned
          </span>
          <p className="text-base font-bold text-status-success font-mono mt-0.5">{totalEarned.toLocaleString()}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-bg-primary/60 border border-border-subtle">
          <span className="text-[11px] text-text-dim flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-accent-secondary" /> Lifetime Spent
          </span>
          <p className="text-base font-bold text-accent-secondary font-mono mt-0.5">{totalSpent.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
