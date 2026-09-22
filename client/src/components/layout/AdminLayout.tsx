import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Film,
  Coins,
  ShieldAlert,
  ClipboardList,
  Settings,
  ArrowLeft,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actionButton,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userProfile } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'User Directory', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Campaign Moderation', path: '/admin/campaigns', icon: <Film className="w-4 h-4" /> },
    { label: 'Coin Purchase Requests', path: '/admin/coin-requests', icon: <Coins className="w-4 h-4" /> },
    { label: 'Verification Queue', path: '/admin/verification-queue', icon: <ShieldAlert className="w-4 h-4" /> },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: <ClipboardList className="w-4 h-4" /> },
    { label: 'System Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-main flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r border-border-subtle bg-bg-secondary/90 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-white font-['Outfit']">Sub4You Admin</span>
              <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">Control Engine</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-accent-primary text-white shadow-glow-primary'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border-subtle space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-white hover:bg-white/5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Creator Site
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-status-danger hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" /> Admin Logout
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="p-6 border-b border-border-subtle bg-bg-secondary/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
          </div>
          {actionButton && <div>{actionButton}</div>}
        </header>

        {/* Viewport Content */}
        <div className="p-6 flex-1 max-w-7xl w-full">{children}</div>
      </main>
    </div>
  );
};
