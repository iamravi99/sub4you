import React, { useState } from 'react';
import { User as UserIcon, Mail, AtSign, FileText, Sparkles, Check, Image as ImageIcon, Shield } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { userApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { userProfile, refreshUserProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(userProfile?.name || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [avatar, setAvatar] = useState(userProfile?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await userApi.updateProfile({
        name,
        username,
        bio,
        avatar,
      });

      if (res.success) {
        toast.success('Profile updated successfully');
        await refreshUserProfile();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-border-subtle pb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-secondary mb-1">
          <UserIcon className="w-4 h-4" /> Account & Settings
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
          Creator Profile
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Customize your public creator identity and profile statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Avatar & Identity Card */}
        <Card className="p-6 space-y-5 text-center flex flex-col items-center">
          <div className="relative group">
            <img
              src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.email || 'user'}`}
              alt=""
              className="w-24 h-24 rounded-3xl object-cover border-2 border-accent-primary/40 bg-slate-800 shadow-glow-primary"
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">{userProfile?.name}</h3>
            <p className="text-xs text-text-dim">@{userProfile?.username}</p>
            <Badge variant="primary" size="sm" className="mt-2">
              {userProfile?.role === 'admin' ? 'Administrator' : 'Active Creator'}
            </Badge>
          </div>

          <div className="w-full pt-4 border-t border-border-subtle space-y-2 text-xs text-left">
            <div className="flex justify-between text-text-muted">
              <span>Member Since:</span>
              <span className="text-white">
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Campaigns Launched:</span>
              <span className="font-mono text-white font-bold">{userProfile?.campaignsCreated || 0}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Completed Actions:</span>
              <span className="font-mono text-status-success font-bold">{userProfile?.completedActions || 0}</span>
            </div>
          </div>
        </Card>

        {/* Right: Edit Form */}
        <Card className="md:col-span-2 p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Display Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
                />
                <UserIcon className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Public Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
                />
                <AtSign className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Registered Email (Read-only)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={userProfile?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-primary/50 border border-border-subtle text-xs text-text-dim cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Avatar Image URL</label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
                />
                <ImageIcon className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Channel Bio / Description</label>
              <textarea
                rows={3}
                placeholder="Tell the community about your YouTube channel and content niche..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-subtle text-xs text-text-main focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <Button type="submit" variant="primary" size="md" isLoading={isSaving} leftIcon={<Check className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
