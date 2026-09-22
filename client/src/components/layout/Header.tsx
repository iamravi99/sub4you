import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  PlusCircle,
  Wallet,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Bell,
  Menu,
  X,
  CheckCircle2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CoinIcon } from '../common/CoinIcon';
import { Button } from '../common/Button';
import { notificationsApi } from '../../api';
import { AppNotification } from '../../types';

export const Header: React.FC = () => {
  const { userProfile, currentUser, isAdmin, coins, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (userProfile) {
      notificationsApi.getNotifications(1, 5).then((res) => {
        if (res.success) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
        }
      }).catch(() => {});
    }
  }, [userProfile]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      // ignore
    }
  };

  const isLoggedIn = !!userProfile || !!currentUser;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-bg-primary/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary p-0.5 shadow-glow-primary group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-bg-primary rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-secondary animate-pulse-slow" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit'] flex items-center gap-1">
              Sub<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">4You</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-text-dim font-semibold -mt-1">Creator Exchange</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'text-white bg-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>
          <Link
            to="/discover"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/discover' ? 'text-white bg-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4 text-accent-secondary" />
            Discover
          </Link>
          <Link
            to="/how-it-works"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === '/how-it-works' ? 'text-white bg-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            How It Works
          </Link>
          <Link
            to="/pricing"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === '/pricing' ? 'text-white bg-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            Pricing
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* Coin Balance Pill */}
              <Link
                to="/wallet"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all duration-200 group"
                title="Your Available Coins"
              >
                <CoinIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {coins.toLocaleString()} <span className="text-xs uppercase font-sans text-amber-500/80">Coins</span>
                </span>
              </Link>

              {/* Create Campaign CTA */}
              <Link to="/campaigns/create">
                <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Create Campaign
                </Button>
              </Link>

              {/* Notification Center */}
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-cardHover text-text-muted hover:text-text-main transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-primary text-white text-[10px] font-bold flex items-center justify-center border-2 border-bg-primary animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-border-strong bg-bg-card shadow-2xl p-4 z-50 animate-scale-up">
                    <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-accent-primary" /> Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-accent-secondary hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-6">No new notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-3 rounded-xl border transition text-xs ${
                              n.isRead ? 'bg-bg-primary/50 border-border-subtle text-text-muted' : 'bg-accent-primary/10 border-accent-primary/30 text-text-main'
                            }`}
                          >
                            <p className="font-semibold text-white mb-0.5">{n.title}</p>
                            <p className="leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-cardHover transition"
                >
                  <img
                    src={userProfile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.email || 'user'}`}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                  />
                  <span className="text-xs font-semibold text-text-main max-w-[100px] truncate">
                    {userProfile?.name || 'Creator'}
                  </span>
                </button>

                {/* Profile Menu Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-border-strong bg-bg-card shadow-2xl p-2 z-50 animate-scale-up">
                    <div className="px-3 py-2 border-b border-border-subtle mb-1">
                      <p className="text-xs font-bold text-white truncate">{userProfile?.name}</p>
                      <p className="text-[11px] text-text-muted truncate">{userProfile?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-text-main hover:bg-white/5 transition"
                    >
                      <Layers className="w-4 h-4 text-accent-primary" /> Dashboard
                    </Link>
                    <Link
                      to="/campaigns"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-text-main hover:bg-white/5 transition"
                    >
                      <Compass className="w-4 h-4 text-accent-secondary" /> My Campaigns
                    </Link>
                    <Link
                      to="/wallet"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-text-main hover:bg-white/5 transition"
                    >
                      <Wallet className="w-4 h-4 text-amber-400" /> Wallet & Coins
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-text-main hover:bg-white/5 transition"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" /> Profile Settings
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition mt-1"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-400" /> Admin Control
                      </Link>
                    )}

                    <div className="border-t border-border-subtle my-1" />

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-status-danger hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {isLoggedIn && (
            <Link
              to="/wallet"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono"
            >
              <CoinIcon className="w-4 h-4" />
              {coins}
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl border border-border-subtle bg-bg-card text-text-muted hover:text-white"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border-subtle bg-bg-card px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col gap-1">
            <Link to="/" className="px-3 py-2.5 rounded-xl text-sm font-medium text-text-main hover:bg-white/5">
              Home
            </Link>
            <Link to="/discover" className="px-3 py-2.5 rounded-xl text-sm font-medium text-text-main hover:bg-white/5">
              Discover Campaigns
            </Link>
            <Link to="/how-it-works" className="px-3 py-2.5 rounded-xl text-sm font-medium text-text-main hover:bg-white/5">
              How It Works
            </Link>
            <Link to="/pricing" className="px-3 py-2.5 rounded-xl text-sm font-medium text-text-main hover:bg-white/5">
              Pricing
            </Link>

            {isLoggedIn ? (
              <>
                <div className="border-t border-border-subtle my-2" />
                <Link to="/dashboard" className="px-3 py-2.5 rounded-xl text-sm font-semibold text-accent-primary hover:bg-white/5">
                  Creator Dashboard
                </Link>
                <Link to="/campaigns" className="px-3 py-2.5 rounded-xl text-sm font-medium text-text-main hover:bg-white/5">
                  My Campaigns
                </Link>
                <Link to="/campaigns/create" className="px-3 py-2.5 rounded-xl text-sm font-medium text-text-main hover:bg-white/5">
                  Launch New Campaign
                </Link>
                <Link to="/wallet" className="px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:bg-white/5">
                  Wallet ({coins} Coins)
                </Link>
                <Link to="/profile" className="px-3 py-2.5 rounded-xl text-sm font-medium text-text-main hover:bg-white/5">
                  Profile Settings
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="px-3 py-2.5 rounded-xl text-sm font-semibold text-indigo-400 bg-indigo-500/10">
                    Admin Control Panel
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-status-danger hover:bg-rose-500/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4 flex flex-col gap-2">
                <Link to="/login">
                  <Button variant="secondary" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" className="w-full">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
