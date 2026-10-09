import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CampaignDiscovery } from './CampaignDiscovery';
import { MessagingCenter } from './MessagingCenter';
import { WalletLedgerView } from './WalletLedgerView';
import { YouTubeAnalyticsView } from './YouTubeAnalyticsView';
import { CampaignPerformanceView } from './CampaignPerformanceView';
import { ContentSubmissionModal } from './ContentSubmissionModal';
import { PortfolioManager } from './PortfolioManager';
import { 
  Video, 
  Youtube, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  Zap,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../services/api';

interface CreatorDashboardProps {
  onOpenOnboarding: () => void;
}

type CreatorTab = 'overview' | 'portfolio' | 'youtube' | 'performance' | 'discover' | 'messages' | 'credits';

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ onOpenOnboarding }) => {
  const { user, token } = useAuth();
  const profile = user?.creatorProfile;
  const wallet = user?.creditWallet;
  const [activeTab, setActiveTab] = useState<CreatorTab>('overview');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [performanceRefreshTrigger, setPerformanceRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalViews: 0,
    totalEarnings: 0,
    cpmAvg: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;
      try {
        const [creatorSummaryRes, ytRes] = await Promise.allSettled([
          apiRequest<any>('/performance/creator/summary', { headers: { Authorization: `Bearer ${token}` } }),
          apiRequest<any>('/social/youtube/channel', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        let totalViews = 0;
        let activeCamps = 0;
        let totalEarnings = wallet?.balance || 0;

        if (creatorSummaryRes.status === 'fulfilled' && creatorSummaryRes.value.success && creatorSummaryRes.value.data) {
          const sumData = creatorSummaryRes.value.data;
          activeCamps = sumData.activeCampaigns || 0;
          totalViews = sumData.totalVerifiedViews || 0;
          if (sumData.totalEarnings) totalEarnings = sumData.totalEarnings;
        }

        if (ytRes.status === 'fulfilled' && ytRes.value.success && ytRes.value.data) {
          const channelViews = Number(ytRes.value.data?.channel?.totalViews || ytRes.value.data?.totalViews || 0);
          if (channelViews > 0) {
            totalViews = Math.max(totalViews, channelViews);
          }
        }

        setStats({
          activeCampaigns: activeCamps,
          totalViews,
          totalEarnings,
          cpmAvg: activeCamps > 0 ? 50 : 0
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      }
    };
    fetchMetrics();
  }, [wallet?.balance, token]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.5rem',
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
        >
          <LayoutDashboard size={14} /> Overview
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={`btn ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-creator-portfolio"
        >
          <Sparkles size={14} /> AI Portfolio & Workflows
        </button>

        <button
          onClick={() => setActiveTab('youtube')}
          className={`btn ${activeTab === 'youtube' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-creator-youtube"
        >
          <Youtube size={14} /> YouTube Channel & Metrics
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`btn ${activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-creator-performance"
        >
          <ShieldCheck size={14} /> Campaign Performance & Payouts
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`btn ${activeTab === 'discover' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-discover-campaigns"
        >
          <Search size={14} /> Discover Campaigns
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-creator-messages"
        >
          <MessageSquare size={14} /> Messages
        </button>

        <button
          onClick={() => setActiveTab('credits')}
          className={`btn ${activeTab === 'credits' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-creator-credits"
        >
          <Coins size={14} /> Earnings & Ledger
        </button>
      </div>

      {/* Tab Views */}
      {activeTab === 'portfolio' && <PortfolioManager />}
      {activeTab === 'youtube' && <YouTubeAnalyticsView />}
      {activeTab === 'performance' && (
        <CampaignPerformanceView
          onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          refreshTrigger={performanceRefreshTrigger}
        />
      )}
      {activeTab === 'discover' && <CampaignDiscovery />}
      {activeTab === 'messages' && <MessagingCenter />}
      {activeTab === 'credits' && <WalletLedgerView />}

      {/* Content Submission Modal */}
      <ContentSubmissionModal
        isOpen={isSubmitModalOpen}
        campaignId=""
        campaignTitle="Selected Performance Campaign"
        cpmRate={50}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {
          setPerformanceRefreshTrigger(prev => prev + 1);
          setActiveTab('performance');
        }}
      />

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Creator Welcome Banner */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderLeft: '4px solid var(--color-brand)' 
          }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                  <span className="badge badge-verified">
                    <Video size={12} /> Active Workspace: Creator
                  </span>
                  {profile?.isVerified && (
                    <span className="badge badge-verified">
                      <CheckCircle2 size={12} /> Verified Channel
                    </span>
                  )}
                </div>
                <h2>@{profile?.handle || user?.name || 'Creator'}</h2>
                <p style={{ marginTop: '0.25rem' }}>
                  {profile?.location ? `${profile.location} • ` : ''}
                  {profile?.categories?.length ? profile.categories.join(', ') : 'AI Video & Generative Media'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('portfolio')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <Sparkles size={14} /> Manage AI Portfolio
                </button>
                <button onClick={onOpenOnboarding} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  Edit Profile
                </button>
                <button onClick={() => setActiveTab('discover')} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Browse Marketplace
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="metric-box" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('credits')}>
              <div className="flex items-center justify-between">
                <span className="metric-label">Available Earnings</span>
                <Coins size={16} color="var(--color-brand)" />
              </div>
              <div className="metric-value">
                {wallet?.balance ? wallet.balance.toLocaleString() : '0'}
              </div>
              <div className="metric-delta" style={{ color: 'var(--color-brand)' }}>
                Internal Credit Balance
              </div>
            </div>

            <div className="metric-box">
              <div className="flex items-center justify-between">
                <span className="metric-label">Total Verified Views</span>
                <TrendingUp size={16} color="var(--color-success)" />
              </div>
              <div className="metric-value">
                {stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews}
              </div>
              <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
                {stats.totalViews > 0 ? '✓ Live Platform Synced' : 'Connect YouTube to sync'}
              </div>
            </div>

            <div className="metric-box">
              <div className="flex items-center justify-between">
                <span className="metric-label">Active Engagements</span>
                <Video size={16} color="var(--color-info)" />
              </div>
              <div className="metric-value">
                {stats.activeCampaigns}
              </div>
              <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
                Active campaigns & projects
              </div>
            </div>

            <div className="metric-box">
              <div className="flex items-center justify-between">
                <span className="metric-label">Avg Reward CPM</span>
                <Zap size={16} color="var(--color-warning)" />
              </div>
              <div className="metric-value">
                {stats.cpmAvg > 0 ? `₹${stats.cpmAvg}` : 'N/A'}
              </div>
              <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
                Per 1,000 verified views
              </div>
            </div>
          </div>

          {/* YouTube Connection Status Banner */}
          <div className="card" style={{ border: '1px solid var(--border-default)' }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div className="flex items-center gap-3">
                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                }}>
                  <Youtube size={28} />
                </div>
                <div>
                  <h4>YouTube Social Analytics Connector</h4>
                  <p style={{ fontSize: '0.85rem' }}>
                    Connect your YouTube channel to verify views and automatically earn performance-based CPM rewards.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab('youtube')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  Manage YouTube Integration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
