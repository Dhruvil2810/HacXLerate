import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CampaignDiscovery } from './CampaignDiscovery';
import { MessagingCenter } from './MessagingCenter';
import { WalletLedgerView } from './WalletLedgerView';
import { YouTubeAnalyticsView } from './YouTubeAnalyticsView';
import { CampaignPerformanceView } from './CampaignPerformanceView';
import { ContentSubmissionModal } from './ContentSubmissionModal';
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
  ShieldCheck
} from 'lucide-react';

interface CreatorDashboardProps {
  onOpenOnboarding: () => void;
}

type CreatorTab = 'overview' | 'youtube' | 'performance' | 'discover' | 'messages' | 'credits';

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ onOpenOnboarding }) => {
  const { user } = useAuth();
  const profile = user?.creatorProfile;
  const wallet = user?.creditWallet;
  const [activeTab, setActiveTab] = useState<CreatorTab>('overview');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

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
      {activeTab === 'youtube' && <YouTubeAnalyticsView />}
      {activeTab === 'performance' && (
        <CampaignPerformanceView
          onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        />
      )}
      {activeTab === 'discover' && <CampaignDiscovery />}
      {activeTab === 'messages' && <MessagingCenter />}
      {activeTab === 'credits' && <WalletLedgerView />}

      {/* Content Submission Modal */}
      <ContentSubmissionModal
        isOpen={isSubmitModalOpen}
        campaignId="camp_demo_1"
        campaignTitle="Apex Pro ANC Wireless Earbuds Launch"
        cpmRate={65}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {}}
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
                <h2>@{profile?.handle || user?.name}</h2>
                <p style={{ marginTop: '0.25rem' }}>
                  {profile?.location ? `${profile.location} • ` : ''}
                  {profile?.categories?.length ? profile.categories.join(', ') : 'Tech & Reviews'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onOpenOnboarding} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  Edit Niches & Bio
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
                {wallet?.balance.toLocaleString() || '2,850'}
              </div>
              <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
                +750 Credits this week
              </div>
            </div>

            <div className="metric-box">
              <div className="flex items-center justify-between">
                <span className="metric-label">Total Verified Views</span>
                <TrendingUp size={16} color="var(--color-success)" />
              </div>
              <div className="metric-value">
                182.4K
              </div>
              <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
                ✓ Platform Verified (YouTube)
              </div>
            </div>

            <div className="metric-box">
              <div className="flex items-center justify-between">
                <span className="metric-label">Active Campaigns</span>
                <Video size={16} color="var(--color-info)" />
              </div>
              <div className="metric-value">
                2
              </div>
              <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
                1 Under Brand Review
              </div>
            </div>

            <div className="metric-box">
              <div className="flex items-center justify-between">
                <span className="metric-label">Historical CPM</span>
                <Zap size={16} color="var(--color-warning)" />
              </div>
              <div className="metric-value">
                ₹52.5
              </div>
              <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
                Average across campaigns
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
                    Channel connected via Google OAuth. Historical snapshots, audience retention, and incremental CPM view syncs enabled.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-verified">
                  <CheckCircle2 size={12} /> OAuth Connected
                </span>
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  Sync Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
