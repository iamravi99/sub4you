import React, { useEffect, useState } from 'react';
import { Compass, Search, Filter, RefreshCw, Flame, Users, ThumbsUp } from 'lucide-react';
import { CampaignCard } from '../../components/campaigns/CampaignCard';
import { Button } from '../../components/common/Button';
import { campaignsApi } from '../../api';
import { Campaign } from '../../types';

export const DiscoverPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [participatedIds, setParticipatedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const categories = [
    'All',
    'Gaming',
    'Tech & Coding',
    'Entertainment',
    'Music',
    'Education',
    'Vlog & Lifestyle',
  ];

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await campaignsApi.getDiscoverCampaigns({
        type: selectedType,
        category: selectedCategory,
        search: searchQuery,
        page,
        limit: 12,
      });

      if (res.success) {
        setCampaigns(res.data.campaigns);
        setParticipatedIds(res.data.participatedCampaignIds || []);
        setTotalPages(res.data.pagination.pages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error('[Discover Fetch Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedType, selectedCategory, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCampaigns();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-secondary mb-1">
            <Compass className="w-4 h-4" /> Discovery Feed
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            Discover Creator Campaigns
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Engage with authentic creator content on YouTube, complete verified actions, and earn coin rewards.
          </p>
        </div>
        <div className="text-xs font-mono text-text-muted">
          Showing <span className="text-white font-bold">{campaigns.length}</span> of <span className="text-white font-bold">{totalCount}</span> active campaigns
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by video title, keywords, or channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-primary"
          />
          <Search className="w-4 h-4 text-text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Type Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Campaigns', icon: <Flame className="w-3.5 h-3.5" /> },
            { id: 'SUBSCRIBER', label: 'Subscribers', icon: <Users className="w-3.5 h-3.5 text-indigo-400" /> },
            { id: 'LIKE', label: 'Likes', icon: <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedType(t.id);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedType === t.id
                  ? 'bg-accent-primary text-white shadow-glow-primary'
                  : 'bg-bg-card border border-border-subtle text-text-muted hover:text-white'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-text-dim hover:text-text-main hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-bg-card/60 animate-pulse border border-border-subtle" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-border-subtle bg-bg-card space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-bg-primary border border-border-subtle mx-auto flex items-center justify-center text-text-dim">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No campaigns found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            There are currently no active campaigns matching your selected filters. Try searching for different keywords or check back soon.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedType('ALL');
              setSelectedCategory('All');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <CampaignCard
              key={c._id}
              campaign={c}
              isParticipated={participatedIds.includes(c._id)}
              onActionComplete={fetchCampaigns}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-xs font-mono text-text-muted px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
