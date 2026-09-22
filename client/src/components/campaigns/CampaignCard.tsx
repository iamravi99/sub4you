import React, { useState } from 'react';
import { ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { YouTubeIcon } from '../common/YouTubeIcon';
import { Campaign } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CoinIcon } from '../common/CoinIcon';
import { Modal } from '../common/Modal';
import { campaignsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface CampaignCardProps {
  campaign: Campaign;
  isParticipated?: boolean;
  onActionComplete?: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  isParticipated = false,
  onActionComplete,
}) => {
  const { userProfile, refreshUserProfile } = useAuth();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [participated, setParticipated] = useState(isParticipated);
  const [hasOpenedLink, setHasOpenedLink] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [youtubeAccount, setYoutubeAccount] = useState('');

  const progressPercent = Math.min(
    100,
    Math.round((campaign.completedQuantity / campaign.targetQuantity) * 100)
  );

  const creatorId = typeof campaign.creatorId === 'object' ? campaign.creatorId._id : campaign.creatorId;
  const isOwnCampaign = userProfile?._id === creatorId;

  const handleOpenParticipate = async () => {
    if (!userProfile) {
      toast.info('Please log in or create an account to participate in campaigns and earn coins.');
      return;
    }
    if (isOwnCampaign) {
      toast.warning('You cannot participate in your own campaign.');
      return;
    }
    setIsModalOpen(true);
    setIsStarting(true);
    try {
      await campaignsApi.participateCampaign(campaign._id);
      setStartTime(Date.now());
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize participation');
    } finally {
      setIsStarting(false);
    }
  };

  const handleOpenYouTube = () => {
    setHasOpenedLink(true);
    window.open(campaign.youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleVerify = async () => {
    if (!hasOpenedLink) {
      toast.warning('Please click "Open on YouTube" to perform the required action first.');
      return;
    }

    const elapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 30;

    setIsVerifying(true);
    try {
      const res = await campaignsApi.verifyAction(campaign._id, elapsedSeconds, youtubeAccount);
      if (res.success) {
        if (res.data.status === 'VERIFIED') {
          toast.success(`Action verified! You earned ${res.data.rewardEarned} coin(s)!`);
          setParticipated(true);
          await refreshUserProfile();
          onActionComplete?.();
          setIsModalOpen(false);
        } else if (res.data.status === 'REVIEW') {
          toast.info('Action submitted for moderation review. Coins will be rewarded once approved.');
          setParticipated(true);
          setIsModalOpen(false);
        } else {
          toast.error(res.data.message || 'Verification rejected by anti-fraud filter.');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="group rounded-2xl border border-border-subtle bg-bg-card overflow-hidden shadow-card hover:border-border-strong hover:bg-bg-cardHover transition-all duration-300 flex flex-col">
        {/* Thumbnail & Video Header */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
          <img
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${campaign.youtubeVideoId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-80" />

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            {campaign.type === 'SUBSCRIBER' ? (
              <Badge variant="primary">Subscriber Campaign</Badge>
            ) : (
              <Badge variant="cyan">Like Campaign</Badge>
            )}
          </div>

          {/* Reward Pill */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 text-xs font-bold font-mono shadow-lg">
            <CoinIcon className="w-3.5 h-3.5" />
            <span>+{campaign.costPerAction} Coin</span>
          </div>

          {/* Category */}
          <div className="absolute bottom-3 left-3 text-[11px] font-medium text-slate-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
            {campaign.category || 'Creator'}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-accent-secondary transition-colors">
              {campaign.title}
            </h3>
            <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
              <YouTubeIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{campaign.youtubeChannelTitle || 'Verified Creator'}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-dim">
              <span>Progress</span>
              <span className="font-mono text-text-main font-semibold">
                {campaign.completedQuantity} / {campaign.targetQuantity} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* CTA Action */}
          <div className="pt-2 border-t border-border-subtle">
            {isOwnCampaign ? (
              <Button variant="secondary" size="sm" className="w-full" disabled>
                Your Campaign
              </Button>
            ) : participated ? (
              <Button variant="outline" size="sm" className="w-full text-status-success border-status-success/30" disabled>
                <CheckCircle2 className="w-4 h-4 mr-1 text-status-success" /> Completed
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleOpenParticipate}
                isLoading={isStarting}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Participate & Earn {campaign.costPerAction} Coin
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Participation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${campaign.type === 'SUBSCRIBER' ? 'Subscribe' : 'Like'} & Earn Reward`}
        maxWidth="md"
      >
        <div className="space-y-5">
          {/* Campaign Overview Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary border border-border-subtle">
            <img
              src={campaign.thumbnailUrl}
              alt=""
              className="w-16 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{campaign.title}</p>
              <p className="text-[11px] text-text-muted truncate">{campaign.youtubeChannelTitle}</p>
              <p className="text-[11px] font-bold text-amber-400 mt-0.5">Reward: {campaign.costPerAction} Coin</p>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3 text-xs text-text-muted">
            <h4 className="font-semibold text-white">Instructions:</h4>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-accent-primary/20 text-accent-primary font-bold flex items-center justify-center shrink-0">1</span>
              <p>Click <strong className="text-white">"Open on YouTube"</strong> below to view this video on YouTube.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-accent-primary/20 text-accent-primary font-bold flex items-center justify-center shrink-0">2</span>
              <p>
                {campaign.type === 'SUBSCRIBER'
                  ? 'Subscribe to the creator\'s channel and watch at least 30 seconds.'
                  : 'Hit the Like button on the video and leave an honest engagement.'}
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-accent-primary/20 text-accent-primary font-bold flex items-center justify-center shrink-0">3</span>
              <p>Return here and click <strong className="text-white">"Verify & Claim Coins"</strong> to receive your reward.</p>
            </div>
          </div>

          {/* Open on YouTube Button */}
          <button
            onClick={handleOpenYouTube}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-glow-rose transition active:scale-[0.98]"
          >
            <YouTubeIcon className="w-5 h-5" /> Open on YouTube <ExternalLink className="w-4 h-4 opacity-80" />
          </button>

          {hasOpenedLink && (
            <div className="p-3 rounded-xl bg-status-success/10 border border-status-success/25 text-status-success text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>YouTube link opened! Perform the action, then claim your coins below.</span>
            </div>
          )}

          {/* Optional YouTube Handle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Your YouTube Channel / Handle (Optional for faster review)</label>
            <input
              type="text"
              placeholder="@yourchannel"
              value={youtubeAccount}
              onChange={(e) => setYoutubeAccount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-text-main text-xs focus:outline-none focus:border-accent-primary"
            />
          </div>

          {/* Verification CTA */}
          <div className="pt-2 border-t border-border-subtle flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleVerify}
              isLoading={isVerifying}
              disabled={!hasOpenedLink}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Verify & Claim Coins
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
