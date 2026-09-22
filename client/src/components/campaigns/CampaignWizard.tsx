import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  ThumbsUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Coins,
  Shield,
  Loader2,
} from 'lucide-react';
import { YouTubeIcon } from '../common/YouTubeIcon';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { CoinIcon } from '../common/CoinIcon';
import { campaignsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CampaignWizard: React.FC = () => {
  const navigate = useNavigate();
  const { coins, refreshUserProfile } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [videoMeta, setVideoMeta] = useState<{
    videoId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channelTitle: string;
  } | null>(null);

  const [campaignType, setCampaignType] = useState<'SUBSCRIBER' | 'LIKE'>('SUBSCRIBER');
  const [targetQuantity, setTargetQuantity] = useState<number>(50);
  const [category, setCategory] = useState('Entertainment');
  const [language, setLanguage] = useState('English');
  const [targetAudience, setTargetAudience] = useState('Global');
  const [customTitle, setCustomTitle] = useState('');
  const [description, setDescription] = useState('');

  const [isLaunching, setIsLaunching] = useState(false);

  // Calculate Budget
  const costPerAction = 1; // 1 Coin per verified sub/like
  const totalBudget = targetQuantity * costPerAction;
  const hasEnoughCoins = coins >= totalBudget;
  const remainingCoins = Math.max(0, coins - totalBudget);

  // Step 1: Validate YouTube URL
  const handleValidateUrl = async () => {
    if (!youtubeUrl.trim()) {
      toast.warning('Please enter a valid YouTube video link');
      return;
    }

    setIsValidatingUrl(true);
    try {
      const res = await campaignsApi.validateYoutubeUrl(youtubeUrl);
      if (res.success && res.data) {
        setVideoMeta(res.data);
        setCustomTitle(res.data.title);
        setDescription(res.data.description?.slice(0, 300) || '');
        toast.success('YouTube video verified and extracted!');
        setStep(2);
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not fetch video details. Check link format.');
    } finally {
      setIsValidatingUrl(false);
    }
  };

  // Step 3: Launch Campaign
  const handleLaunchCampaign = async () => {
    if (!hasEnoughCoins) {
      toast.error(`You need ${totalBudget} coins to launch this campaign. Current balance: ${coins} coins.`);
      return;
    }

    setIsLaunching(true);
    try {
      const res = await campaignsApi.createCampaign({
        title: customTitle || videoMeta?.title || 'YouTube Campaign',
        description,
        youtubeUrl,
        type: campaignType,
        targetQuantity,
        category,
        language,
        targetAudience,
      });

      if (res.success) {
        toast.success('Campaign launched and escrow reserved successfully!');
        await refreshUserProfile();
        navigate('/campaigns');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to launch campaign');
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Wizard Step Progress Tracker */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-6">
        {[
          { num: 1, label: 'Video URL' },
          { num: 2, label: 'Objective & Budget' },
          { num: 3, label: 'Review & Launch' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center transition-all ${
                step === s.num
                  ? 'bg-accent-primary text-white shadow-glow-primary'
                  : step > s.num
                  ? 'bg-status-success/20 text-status-success border border-status-success/30'
                  : 'bg-bg-card border border-border-subtle text-text-dim'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${step === s.num ? 'text-white' : 'text-text-muted'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Paste URL */}
      {step === 1 && (
        <Card className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <YouTubeIcon className="w-6 h-6 text-rose-500" /> Enter YouTube Video URL
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Paste the link to the YouTube video you want to promote. Our platform will automatically extract video information, thumbnails, and channel metadata.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-text-main">YouTube Video Link</label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-bg-primary border border-border-subtle text-sm text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition"
              />
            </div>
            <p className="text-[11px] text-text-dim">
              Supports standard YouTube URLs, Shorts (youtube.com/shorts/...), and short links (youtu.be/...).
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-subtle">
            <Button
              variant="primary"
              onClick={handleValidateUrl}
              isLoading={isValidatingUrl}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Verify Video
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Objective & Budget */}
      {step === 2 && videoMeta && (
        <Card className="space-y-6 animate-fade-in">
          {/* Video Metadata Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-bg-primary border border-border-subtle">
            <img
              src={videoMeta.thumbnailUrl}
              alt=""
              className="w-full sm:w-36 aspect-video rounded-lg object-cover bg-slate-800 shrink-0"
            />
            <div className="space-y-1 text-center sm:text-left min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-accent-secondary">Verified YouTube Video</span>
              <h3 className="text-sm font-bold text-white truncate">{videoMeta.title}</h3>
              <p className="text-xs text-text-muted">{videoMeta.channelTitle}</p>
            </div>
          </div>

          {/* Campaign Objective Selectors */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-text-main">Choose Campaign Objective</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setCampaignType('SUBSCRIBER')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  campaignType === 'SUBSCRIBER'
                    ? 'bg-accent-primary/10 border-accent-primary shadow-glow-primary'
                    : 'bg-bg-primary border-border-subtle hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-400 font-mono">1 Sub = 1 Coin</span>
                </div>
                <h4 className="text-sm font-bold text-white">Subscriber Campaign</h4>
                <p className="text-xs text-text-muted mt-1">
                  Grow your subscriber base with authentic YouTube creator community members.
                </p>
              </div>

              <div
                onClick={() => setCampaignType('LIKE')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  campaignType === 'LIKE'
                    ? 'bg-cyan-500/10 border-cyan-500 shadow-glow-cyan'
                    : 'bg-bg-primary border-border-subtle hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-400 font-mono">1 Like = 1 Coin</span>
                </div>
                <h4 className="text-sm font-bold text-white">Video Like Campaign</h4>
                <p className="text-xs text-text-muted mt-1">
                  Boost video engagement signals, likes, and algorithmic watch time.
                </p>
              </div>
            </div>
          </div>

          {/* Target Quantity Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-main">Target Quantity (Goal)</label>
              <span className="text-xs font-bold text-accent-secondary font-mono">{targetQuantity} Actions</span>
            </div>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 250].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setTargetQuantity(qty)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    targetQuantity === qty
                      ? 'bg-accent-primary text-white border-accent-primary'
                      : 'bg-bg-primary border-border-subtle text-text-muted hover:text-white'
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={targetQuantity}
              onChange={(e) => setTargetQuantity(parseInt(e.target.value, 10))}
              className="w-full accent-accent-primary h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Real-time Budget & Coin Balance Preview */}
          <div className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Total Campaign Cost:</span>
              <span className="font-bold text-white font-mono flex items-center gap-1.5">
                <CoinIcon className="w-4 h-4" /> {totalBudget} Coins
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Your Available Balance:</span>
              <span className={`font-bold font-mono ${hasEnoughCoins ? 'text-status-success' : 'text-status-danger'}`}>
                {coins} Coins
              </span>
            </div>

            {!hasEnoughCoins && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Insufficient coin balance (Need {totalBudget - coins} more)</span>
                </div>
                <Link to="/wallet">
                  <Button variant="gold" size="sm">
                    Buy Coins
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(3)}
              disabled={!hasEnoughCoins}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Review
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Campaign Review & Launch */}
      {step === 3 && videoMeta && (
        <Card className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-accent-primary" /> Review & Escrow Confirmation
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Confirm your campaign details. The budget will be held in secure escrow and only paid out to participants as actions are verified.
            </p>
          </div>

          {/* Target Audience & Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Gaming">Gaming</option>
                <option value="Tech & Coding">Tech & Coding</option>
                <option value="Music">Music</option>
                <option value="Education">Education</option>
                <option value="Vlog & Lifestyle">Vlog & Lifestyle</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="Hindi">Hindi</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Global">All Languages</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1.5">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-bg-primary to-bg-card border border-border-strong space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent-secondary">Campaign Summary</h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-text-dim block">Objective:</span>
                <span className="font-bold text-white">{campaignType === 'SUBSCRIBER' ? 'Subscribers' : 'Video Likes'}</span>
              </div>
              <div>
                <span className="text-text-dim block">Target Quantity:</span>
                <span className="font-bold text-white font-mono">{targetQuantity}</span>
              </div>
              <div>
                <span className="text-text-dim block">Total Escrow:</span>
                <span className="font-bold text-amber-400 font-mono flex items-center gap-1">
                  <CoinIcon className="w-3.5 h-3.5" /> {totalBudget} Coins
                </span>
              </div>
              <div>
                <span className="text-text-dim block">Remaining Balance:</span>
                <span className="font-bold text-status-success font-mono">{remainingCoins} Coins</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleLaunchCampaign}
              isLoading={isLaunching}
              leftIcon={<Sparkles className="w-5 h-5" />}
            >
              Launch Campaign ({totalBudget} Coins)
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
