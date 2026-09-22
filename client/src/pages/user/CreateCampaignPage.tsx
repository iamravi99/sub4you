import React from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';
import { CampaignWizard } from '../../components/campaigns/CampaignWizard';

export const CreateCampaignPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/25 text-xs font-semibold text-accent-primary">
          <Sparkles className="w-3.5 h-3.5 text-accent-secondary" />
          <span>Launch Campaign</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
          Create YouTube Campaign
        </h1>
        <p className="text-xs text-text-muted">
          Promote your channel with escrow protection. Coins are only paid out when actions are verified.
        </p>
      </div>

      {/* Wizard */}
      <CampaignWizard />
    </div>
  );
};
