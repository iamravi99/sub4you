import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Coins,
  Users,
  ThumbsUp,
  ArrowRight,
  Lock,
  RefreshCw,
  Award,
} from 'lucide-react';
import { YouTubeIcon } from '../../components/common/YouTubeIcon';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="primary">Platform Architecture & Guide</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-['Outfit']">
          How Sub4You Works
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Learn how our peer-to-peer creator ecosystem balances campaign creation, automated YouTube verification, and guaranteed escrow protection.
        </p>
      </div>

      {/* Two Persona Paths: For Creators vs For Participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Creator Workflow */}
        <Card className="p-8 space-y-6 border-accent-primary/30 relative overflow-hidden">
          <div className="space-y-2">
            <Badge variant="primary">For Content Creators</Badge>
            <h2 className="text-2xl font-bold text-white">Launching Campaigns</h2>
            <p className="text-xs text-text-muted">Scale your channel subscribers and likes with escrow safety.</p>
          </div>

          <div className="space-y-4 text-xs text-text-muted">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-primary text-white font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <h4 className="font-bold text-white text-sm">Paste YouTube Video</h4>
                <p className="mt-0.5">Input your video URL. We automatically query metadata and preview your campaign.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-primary text-white font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <h4 className="font-bold text-white text-sm">Allocate Coin Budget</h4>
                <p className="mt-0.5">Set target quantities (e.g. 100 subscribers = 100 coins). Budget is placed into escrow.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-primary text-white font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <h4 className="font-bold text-white text-sm">Escrow Protection & Refunds</h4>
                <p className="mt-0.5">Coins are only paid out as verified users perform actions. Cancel anytime to receive remaining escrow coins instantly.</p>
              </div>
            </div>
          </div>

          <Link to="/campaigns/create">
            <Button variant="primary" className="w-full">
              Launch a Campaign
            </Button>
          </Link>
        </Card>

        {/* Participant Workflow */}
        <Card className="p-8 space-y-6 border-accent-secondary/30 relative overflow-hidden">
          <div className="space-y-2">
            <Badge variant="cyan">For Viewers & Earners</Badge>
            <h2 className="text-2xl font-bold text-white">Earning Coin Rewards</h2>
            <p className="text-xs text-text-muted">Discover channels and receive coins for authentic support.</p>
          </div>

          <div className="space-y-4 text-xs text-text-muted">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-secondary text-slate-950 font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <h4 className="font-bold text-white text-sm">Browse Discovery Feed</h4>
                <p className="mt-0.5">Explore active subscriber and like campaigns across gaming, tech, entertainment, and more.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-secondary text-slate-950 font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <h4 className="font-bold text-white text-sm">Complete Action on YouTube</h4>
                <p className="mt-0.5">Watch, like the video, or subscribe to the creator directly on the YouTube platform.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-secondary text-slate-950 font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <h4 className="font-bold text-white text-sm">Verify & Claim Balance</h4>
                <p className="mt-0.5">Return to Sub4You to verify your action and claim coins directly into your wallet.</p>
              </div>
            </div>
          </div>

          <Link to="/discover">
            <Button variant="secondary" className="w-full">
              Explore Active Feeds
            </Button>
          </Link>
        </Card>
      </div>

      {/* Security & Verification Pipeline */}
      <Card className="p-8 sm:p-10 space-y-6 bg-gradient-to-r from-bg-card to-bg-secondary border-border-strong">
        <div className="space-y-2">
          <Badge variant="success">Anti-Fraud & Policy</Badge>
          <h3 className="text-2xl font-bold text-white">How Actions Are Verified</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            We prioritize legitimate engagement. Every action flows through our four-stage verification engine:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-2">
            <span className="font-bold text-accent-primary block">Stage 1: Session Initiation</span>
            <p className="text-text-muted">Unique tokens and timestamps are bound to the user intent before opening YouTube.</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-2">
            <span className="font-bold text-accent-secondary block">Stage 2: Velocity Analysis</span>
            <p className="text-text-muted">Actions under 10 seconds or high-frequency automated bursts are flagged by risk filters.</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-2">
            <span className="font-bold text-status-success block">Stage 3: Escrow Settlement</span>
            <p className="text-text-muted">Low-risk actions are settled immediately in MongoDB with auditable transaction ledger entries.</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-primary border border-border-subtle space-y-2">
            <span className="font-bold text-amber-400 block">Stage 4: Admin Moderation</span>
            <p className="text-text-muted">Borderline attempts are escalated to the human moderation queue for verification.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
