import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, LogIn, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, devLogin } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      const destination = from && from !== '/' && from !== '/login' ? from : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      const destination = from && from !== '/' && from !== '/login' ? from : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Google sign in failed');
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-text-muted">Sign in to manage your creator campaigns and coin wallet</p>
        </div>

        {/* Card Form */}
        <Card className="p-6 sm:p-8 space-y-5 border-border-strong bg-bg-card/90">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-main">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-accent-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
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
              rightIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
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
            onClick={handleGoogleLogin}
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
            Continue with Google
          </button>

          {/* Admin Link */}
          <div className="pt-2 border-t border-border-subtle text-center">
            <Link to="/admin/login" className="text-xs text-text-dim hover:text-indigo-400 transition flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff & Administrator Portal
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-semibold text-accent-primary hover:underline">
            Sign Up Free (Get 25 Coins)
          </Link>
        </p>
      </div>
    </div>
  );
};
