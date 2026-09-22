import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User as UserIcon, UserPlus, Gift } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CoinIcon } from '../../components/common/CoinIcon';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warning('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, name);
      toast.success('Account created! 25 welcome bonus coins added to your wallet.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary p-0.5 shadow-glow-primary">
              <div className="w-full h-full bg-bg-primary rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-secondary" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-white font-['Outfit']">Sub4You</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Creator Account</h2>
          <p className="text-xs text-text-muted">Join the platform to launch campaigns and earn coins</p>
        </div>

        {/* Welcome Bonus Notice */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <CoinIcon className="w-3.5 h-3.5" /> 25 Free Coins on Registration!
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Instantly test campaign launches or save coins in your escrow wallet.
            </p>
          </div>
        </div>

        {/* Card Form */}
        <Card className="p-6 sm:p-8 space-y-5 border-border-strong bg-bg-card/90">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Full Name / Channel Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivers Tech"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-primary"
                />
                <UserIcon className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="creator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-primary"
                />
                <Mail className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Create Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-primary"
                />
                <Lock className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<UserPlus className="w-4 h-4" />}
            >
              Create Account & Claim Coins
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-border-subtle w-full" />
            <span className="bg-bg-card px-3 text-[10px] uppercase font-bold text-text-dim tracking-wider">or</span>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border-subtle bg-bg-primary hover:bg-white/5 text-xs font-semibold text-white transition active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign up with Google
          </button>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
