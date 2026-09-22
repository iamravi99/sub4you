import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, PlusCircle, Wallet, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { userProfile, coins } = useAuth();
  const path = location.pathname;

  // Don't show bottom nav on admin routes
  if (path.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Home', to: '/', icon: Home, active: path === '/' },
    { label: 'Discover', to: '/discover', icon: Compass, active: path === '/discover' },
    {
      label: 'Launch',
      to: userProfile ? '/campaigns/create' : '/signup',
      icon: PlusCircle,
      isPrimary: true,
      active: path === '/campaigns/create',
    },
    {
      label: 'Wallet',
      to: userProfile ? '/wallet' : '/login',
      icon: Wallet,
      active: path === '/wallet',
      badge: userProfile ? `${coins}` : undefined,
    },
    {
      label: userProfile ? 'Dashboard' : 'Login',
      to: userProfile ? '/dashboard' : '/login',
      icon: userProfile ? LayoutDashboard : UserIcon,
      active: path === '/dashboard' || path === '/profile' || path === '/login',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070B14]/95 backdrop-blur-xl border-t border-border-subtle/80 px-2 py-1.5 pb-safe shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.label}
                to={item.to}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary p-0.5 shadow-glow-primary group-active:scale-95 transition-transform duration-150">
                  <div className="w-full h-full bg-accent-primary rounded-[14px] flex items-center justify-center text-white">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-accent-secondary mt-1 tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors duration-150 relative ${
                item.active
                  ? 'text-accent-primary font-bold'
                  : 'text-text-muted hover:text-text-main font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.active ? 'text-accent-primary scale-110' : 'text-text-dim'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-mono font-bold leading-tight">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${item.active ? 'text-white font-bold' : 'text-text-dim'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
