import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check, ShieldCheck, HelpCircle, Coins } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CoinIcon } from '../../components/common/CoinIcon';
import { PurchaseModal } from '../../components/wallet/PurchaseModal';
import { DEFAULT_COIN_PACKAGES } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export const PricingPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="warning">Transparent Pricing</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-['Outfit']">
          Coin Bundles & Growth Packages
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Purchase coins to power your subscriber and like campaigns or earn coins for free by engaging with other creators.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEFAULT_COIN_PACKAGES.map((pkg) => (
          <Card
            key={pkg.id}
            className={`p-6 flex flex-col justify-between relative transition-all duration-200 ${
              pkg.popular
                ? 'border-accent-primary bg-bg-card/90 shadow-glow-primary scale-105 z-10'
                : 'hover:border-border-strong'
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                Best Creator Value
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">{pkg.label}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-white font-mono">${pkg.price}</span>
                  <span className="text-xs text-text-muted">/ one-time</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-primary border border-border-subtle">
                <CoinIcon className="w-6 h-6" />
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  {pkg.coins.toLocaleString()} <span className="text-xs uppercase font-sans text-amber-500/80">Coins</span>
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-text-muted pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-status-success shrink-0" />
                  <span>Up to {pkg.coins} Verified Subscribers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-status-success shrink-0" />
                  <span>Up to {pkg.coins} YouTube Video Likes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-status-success shrink-0" />
                  <span>100% Escrow Protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-status-success shrink-0" />
                  <span>Instant Cancellation Refunds</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {userProfile ? (
                <Button
                  variant={pkg.popular ? 'primary' : 'secondary'}
                  className="w-full"
                  onClick={() => setIsModalOpen(true)}
                >
                  Request Package
                </Button>
              ) : (
                <Link to="/signup">
                  <Button variant={pkg.popular ? 'primary' : 'secondary'} className="w-full">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Free Earning Banner */}
      <div className="p-8 rounded-3xl bg-bg-card border border-border-strong flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <Coins className="w-5 h-5 text-amber-400" /> Prefer Not to Pay?
          </h3>
          <p className="text-xs text-text-muted max-w-lg">
            You can earn unlimited coins for free! Explore active campaigns on the Discovery feed, support other creators, and use your earnings to launch your own campaigns.
          </p>
        </div>
        <Link to="/discover">
          <Button variant="gold" size="md">
            Start Earning Free Coins
          </Button>
        </Link>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packages={DEFAULT_COIN_PACKAGES}
      />
    </div>
  );
};
