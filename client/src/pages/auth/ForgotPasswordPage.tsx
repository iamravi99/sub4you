import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSent(true);
      toast.success('Password reset link sent! Check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send password reset email');
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-text-muted">Enter your registered email to receive a recovery link</p>
        </div>

        {/* Card Form */}
        <Card className="p-6 sm:p-8 space-y-5 border-border-strong bg-bg-card/90">
          {isSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-status-success/20 text-status-success mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                If an account exists with <strong className="text-white">{email}</strong>, you will receive an email with instructions on how to reset your password.
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full mt-2">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main">Your Email Address</label>
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

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<KeyRound className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="pt-2 border-t border-border-subtle text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
