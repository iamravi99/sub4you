import React, { useState } from 'react';
import { Sparkles, Check, ShieldCheck, CreditCard, Info } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CoinIcon } from '../common/CoinIcon';
import { CoinPackage } from '../../types';
import { walletApi } from '../../api';
import { useToast } from '../../context/ToastContext';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: CoinPackage[];
  onRequestSubmitted?: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  packages,
  onRequestSubmitted,
}) => {
  const toast = useToast();
  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[1]?.id || packages[0]?.id || 'pkg_500');
  const [paymentMethod, setPaymentMethod] = useState('ADMIN_APPROVAL');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;

    setIsSubmitting(true);
    try {
      const res = await walletApi.createPurchaseRequest({
        packageId: selectedPkg.id,
        paymentMethod,
        paymentNotes,
      });

      if (res.success) {
        toast.success(res.message || 'Coin purchase request submitted! An admin will review and credit your balance.');
        onRequestSubmitted?.();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit purchase request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purchase / Request Creator Coins" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-xs text-text-muted">
            Select a coin bundle to power your subscriber and like growth campaigns. Your request will be queued in the Admin Approval Dashboard.
          </p>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packages.map((pkg) => {
            const isSelected = selectedPkgId === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkgId(pkg.id)}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 scale-[1.02]'
                    : 'bg-bg-primary border-border-subtle hover:border-border-strong'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-text-dim block">{pkg.label}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CoinIcon className="w-5 h-5" />
                      <span className="text-xl font-bold text-white font-mono">
                        {pkg.coins.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400 font-mono">${pkg.price.toFixed(2)}</span>
                    <span className="text-[10px] text-text-dim block uppercase">USD</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Notes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-main">
            Payment Notes / Transaction Reference (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. PayPal Transaction ID, Bank Ref, or Sandbox Request"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
          />
        </div>

        {/* Admin Workflow Notice */}
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            Secure Coin Escrow: When you submit this request, administrators review and instantly credit the {selectedPkg?.coins.toLocaleString()} coins directly to your wallet with full audit logs.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Submit Request (${selectedPkg?.price.toFixed(2)})
          </Button>
        </div>
      </form>
    </Modal>
  );
};
