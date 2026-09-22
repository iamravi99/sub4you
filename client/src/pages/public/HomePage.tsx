import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Coins,
  Users,
  ThumbsUp,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  Play,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { YouTubeIcon } from '../../components/common/YouTubeIcon';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { CoinIcon } from '../../components/common/CoinIcon';
import { CampaignCard } from '../../components/campaigns/CampaignCard';
import { campaignsApi } from '../../api';
import { Campaign } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const HomePage: React.FC = () => {
  const { userProfile } = useAuth();
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    campaignsApi
      .getDiscoverCampaigns({ limit: 3 })
      .then((res) => {
        if (res.success) {
          setFeaturedCampaigns(res.data.campaigns);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent-primary/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-accent-secondary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/25 backdrop-blur-md text-xs font-semibold text-accent-primary animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent-secondary animate-pulse-slow" />
            <span>The Premier Creator Exchange Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto font-['Outfit'] leading-[1.1]">
            Discover Creators.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-indigo-400 to-accent-secondary">
              Launch Campaigns.
            </span>{' '}
            Grow Your Reach.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            The next-generation ecosystem connecting passionate YouTube creators. Earn coins by engaging with real channels and deploy escrow-protected campaigns for verified subscribers and likes.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {userProfile ? (
              <Link to="/dashboard">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Go to Creator Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Get Started Free
                </Button>
              </Link>
            )}
            <Link to="/discover">
              <Button size="lg" variant="secondary" leftIcon={<Flame className="w-5 h-5 text-amber-400" />}>
                Explore Active Campaigns
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12">
            {[
              { label: 'Active Campaigns', value: '1,400+' },
              { label: 'Verified Actions', value: '450,000+' },
              { label: 'Coins Exchanged', value: '8.2M+' },
              { label: 'Escrow Security', value: '100% Protected' },
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-bg-card/70 border border-border-subtle backdrop-blur-md">
                <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stat.value}</p>
                <p className="text-xs text-text-muted mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED LIVE CAMPAIGNS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-secondary mb-1">
              <Flame className="w-4 h-4 text-amber-400" /> Live Creator Campaigns
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
              Featured Opportunities
            </h2>
          </div>
          <Link to="/discover" className="text-sm font-semibold text-accent-primary hover:text-accent-primaryHover flex items-center gap-1">
            View all campaigns <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-900 animate-pulse" />
            ))}
          </div>
        ) : featuredCampaigns.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-bg-card border border-border-subtle space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/10 flex items-center justify-center text-accent-primary">
              <Flame className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Active Campaigns Yet</h3>
              <p className="text-xs text-text-muted">Be the first creator to launch a subscriber or like campaign!</p>
            </div>
            <Link to="/campaigns/create">
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Your First Campaign
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCampaigns.map((c) => (
              <CampaignCard key={c._id} campaign={c} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="primary">Simple & Transparent</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            How Sub4You Works
          </h2>
          <p className="text-sm text-text-muted">
            Whether you want to earn coins or grow your own YouTube channel, our escrow engine makes the process effortless and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Create Account',
              desc: 'Sign up in seconds and receive 25 welcome bonus coins to kickstart your journey.',
              icon: <Users className="w-6 h-6 text-indigo-400" />,
            },
            {
              step: '02',
              title: 'Get or Earn Coins',
              desc: 'Participate in creator campaigns or purchase coin bundles directly.',
              icon: <Coins className="w-6 h-6 text-amber-400" />,
            },
            {
              step: '03',
              title: 'Launch Campaign',
              desc: 'Paste your YouTube link, choose Subscribers or Likes, and allocate your budget.',
              icon: <YouTubeIcon className="w-6 h-6 text-rose-500" />,
            },
            {
              step: '04',
              title: 'Escrow Payouts',
              desc: 'Coins are released only when YouTube actions are successfully verified by our anti-fraud engine.',
              icon: <ShieldCheck className="w-6 h-6 text-status-success" />,
            },
          ].map((item, idx) => (
            <Card key={idx} className="relative space-y-4 hover:border-accent-primary/40 transition-all">
              <span className="text-3xl font-black text-slate-800 font-mono absolute top-4 right-4">
                {item.step}
              </span>
              <div className="w-12 h-12 rounded-2xl bg-bg-primary border border-border-subtle flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CORE VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border-strong bg-gradient-to-b from-bg-card to-bg-secondary p-8 sm:p-12 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <Badge variant="cyan">Engineered for Quality</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
                Why Top Creators Trust Our Ecosystem
              </h2>
              <div className="space-y-4 text-xs text-text-muted">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-status-success/15 text-status-success shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Escrow Protection Guarantee</h4>
                    <p className="mt-0.5">Your campaign budget is never burned up-front. Remaining coins are refunded anytime with one click.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent-primary/15 text-accent-primary shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Multi-Layer Anti-Fraud Filtering</h4>
                    <p className="mt-0.5">Automated velocity scoring, bot detection, and manual review queues prevent fake engagements.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent-secondary/15 text-accent-secondary shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Modular YouTube Integration</h4>
                    <p className="mt-0.5">Direct video validation and channel extraction built strictly according to YouTube API guidelines.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Box */}
            <div className="p-6 rounded-2xl bg-bg-primary/90 border border-border-strong shadow-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="text-accent-secondary font-bold">LEDGER_STATUS</span>
                <span className="text-status-success flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-status-success animate-ping" /> VERIFIED
                </span>
              </div>
              <div className="space-y-2 text-text-dim text-[11px]">
                <div className="flex justify-between">
                  <span>ESCROW_RESERVE:</span>
                  <span className="text-white">100.00 COINS</span>
                </div>
                <div className="flex justify-between">
                  <span>ACTION_PAYLOAD:</span>
                  <span className="text-accent-primary">SUBSCRIBER_VERIFIED</span>
                </div>
                <div className="flex justify-between">
                  <span>RISK_ASSESSMENT:</span>
                  <span className="text-status-success font-bold">SCORE: 12 (LOW_RISK)</span>
                </div>
                <div className="flex justify-between">
                  <span>SETTLEMENT:</span>
                  <span className="text-amber-400">+1.00 COIN → PARTICIPANT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">Frequently Asked Questions</h2>
          <p className="text-xs text-text-muted">Everything you need to know about coins, verification, and campaign launches.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How do coins work?',
              a: 'Coins are the platform credit. You earn coins by participating in other creators campaigns (subscribing or liking). You spend coins to launch your own campaigns (1 coin per verified subscriber or like).',
            },
            {
              q: 'What happens to unused campaign coins if I cancel?',
              a: 'All unspent coins held in escrow are instantly refunded back to your available wallet balance whenever you cancel or complete a campaign.',
            },
            {
              q: 'How does the platform verify YouTube actions?',
              a: 'We use a combination of automated session tracking, YouTube Data APIs, velocity checks, and anti-fraud analysis. Suspicious or bot activity is queued for manual moderator review.',
            },
            {
              q: 'How do I purchase more coins?',
              a: 'Head to the Wallet page, choose your preferred coin bundle, and submit a purchase request. Our administrators review and credit the coins to your balance.',
            },
          ].map((faq, i) => (
            <Card key={i} className="p-5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-accent-secondary shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-text-muted leading-relaxed pl-6">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-accent-primary to-accent-secondary p-8 sm:p-14 text-center text-white space-y-6 shadow-glow-primary">
          <h2 className="text-3xl sm:text-5xl font-black font-['Outfit'] tracking-tight">
            Ready to Scale Your YouTube Channel?
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto">
            Join thousands of active creators today. Launch your first subscriber or like campaign in under 2 minutes.
          </p>
          <div>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100 font-bold border-none shadow-2xl">
                Create Your Account Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
