import React, { useEffect, useState } from 'react';
import { Settings, Save, ShieldCheck, Coins, RefreshCw, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { adminApi } from '../../api';
import { SystemSettings } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const toast = useToast();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.success) {
        setSettings(res.data.settings);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const res = await adminApi.updateSettings(settings);
      if (res.success) {
        toast.success('System settings saved and applied platform-wide!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <AdminLayout title="System Settings" subtitle="Loading configurations...">
        <div className="p-12 text-center text-xs text-text-muted">Loading system parameters...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="System Settings & Policy Configuration"
      subtitle="Tune reward rates, budget constraints, anti-fraud thresholds, and bonuses"
      actionButton={
        <Button variant="secondary" size="sm" onClick={fetchSettings} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Reset
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {/* Campaign Budgets & Limits */}
        <Card className="p-6 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" /> Campaign & Budget Limits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Minimum Campaign Budget</label>
              <input
                type="number"
                min="1"
                value={settings.campaignMinBudget}
                onChange={(e) => setSettings({ ...settings, campaignMinBudget: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main font-mono focus:outline-none focus:border-accent-primary"
              />
              <span className="text-[10px] text-text-dim">Minimum coins per launch</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Maximum Campaign Budget</label>
              <input
                type="number"
                min="100"
                value={settings.campaignMaxBudget}
                onChange={(e) => setSettings({ ...settings, campaignMaxBudget: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main font-mono focus:outline-none focus:border-accent-primary"
              />
              <span className="text-[10px] text-text-dim">Maximum coins per launch</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Max Active Campaigns / User</label>
              <input
                type="number"
                min="1"
                value={settings.maxActiveCampaignsPerUser}
                onChange={(e) => setSettings({ ...settings, maxActiveCampaignsPerUser: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main font-mono focus:outline-none focus:border-accent-primary"
              />
              <span className="text-[10px] text-text-dim">Concurrent active cap</span>
            </div>
          </div>
        </Card>

        {/* Anti-Fraud & Risk Thresholds */}
        <Card className="p-6 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-status-success" /> Anti-Fraud Risk Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Review Queue Threshold (Score 0–100)</label>
              <input
                type="number"
                min="10"
                max="90"
                value={settings.fraudThresholdReview}
                onChange={(e) => setSettings({ ...settings, fraudThresholdReview: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main font-mono focus:outline-none focus:border-accent-primary"
              />
              <span className="text-[10px] text-text-dim">Actions with risk exceeding this are queued for review</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Auto-Block Threshold (Score 0–100)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={settings.fraudThresholdBlock}
                onChange={(e) => setSettings({ ...settings, fraudThresholdBlock: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main font-mono focus:outline-none focus:border-accent-primary"
              />
              <span className="text-[10px] text-text-dim">Actions with risk exceeding this are immediately blocked</span>
            </div>
          </div>
        </Card>

        {/* Incentives & Bonus Coins */}
        <Card className="p-6 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-400" /> New User Bonuses
          </h3>

          <div className="space-y-1.5 max-w-xs">
            <label className="text-xs font-semibold text-text-main">Signup Welcome Bonus Coins</label>
            <input
              type="number"
              min="0"
              value={settings.newUserBonusCoins}
              onChange={(e) => setSettings({ ...settings, newUserBonusCoins: parseInt(e.target.value, 10) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main font-mono focus:outline-none focus:border-accent-primary"
            />
            <span className="text-[10px] text-text-dim">Awarded automatically upon account creation</span>
          </div>
        </Card>

        {/* Save CTA */}
        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary" size="lg" isLoading={isSaving} leftIcon={<Save className="w-5 h-5" />}>
            Save System Settings
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};
