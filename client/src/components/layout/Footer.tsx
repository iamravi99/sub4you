import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart } from 'lucide-react';
import { YouTubeIcon } from '../common/YouTubeIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary/60 text-text-muted mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary p-0.5 shadow-glow-primary">
                <div className="w-full h-full bg-bg-primary rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent-secondary" />
                </div>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit']">
                Sub<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">4You</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm">
              The premier peer-to-peer growth and community exchange platform for YouTube creators. Earn coins, discover emerging content, and scale your channel audience transparently.
            </p>
            <div className="flex items-center gap-3 text-xs text-text-dim">
              <Shield className="w-4 h-4 text-accent-primary" />
              <span>Escrow Protected Ledger • Anti-Fraud Verified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/discover" className="hover:text-white transition">Discover Campaigns</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition">How It Works</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition">Coin Packages & Pricing</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">Creator Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Community & Terms</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-white cursor-pointer transition">Community Guidelines</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">YouTube API Services Terms</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-dim">
          <p>© {new Date().getFullYear()} Sub4You Platform. Built for YouTube creators.</p>
          <p className="flex items-center gap-1.5 text-center">
            YouTube™ is a trademark of Google LLC. This platform operates independently via authorized APIs.
          </p>
        </div>
      </div>
    </footer>
  );
};
