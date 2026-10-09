import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProductsManager } from './ProductsManager';
import { CampaignsManager } from './CampaignsManager';
import { CreatorDiscovery } from './CreatorDiscovery';
import { MessagingCenter } from './MessagingCenter';
import { WalletLedgerView } from './WalletLedgerView';
import { CampaignPerformanceView } from './CampaignPerformanceView';
import { apiRequest } from '../services/api';
import { 
  Briefcase, 
  Users, 
  Coins, 
  BarChart3, 
  Search, 
  TrendingUp,
  Package,
  Layers,
  MessageSquare,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

interface BrandDashboardProps {
  onOpenOnboarding: () => void;
}

type BrandTab = 'overview' | 'products' | 'campaigns' | 'performance' | 'creators' | 'messages' | 'credits';

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ onOpenOnboarding }) => {
  const { user, token } = useAuth();
  const profile = user?.brandProfile;
  const wallet = user?.creditWallet;
  const [activeTab, setActiveTab] = useState<BrandTab>('overview');
  const [brandStats, setBrandStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    partneredCreators: 0,
    totalVerifiedViews: 0,
    averageCpm: 0
  });

  useEffect(() => {
    const fetchBrandMetrics = async () => {
      if (!token) return;
      try {
        const res = await apiRequest<any>('/performance/brand/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.success && res.data) {
          const data = res.data;
          const active = data.campaignsPacing?.filter((c: any) => c.status === 'ACTIVE').length || 0;
          const creatorsSet = new Set();
          (data.campaignsPacing || []).forEach((c: any) => {
            if (c.creatorsCount) creatorsSet.add(c.id);
          });

          setBrandStats({
            totalCampaigns: data.totalCampaigns || 0,
            activeCampaigns: active,
            partneredCreators: data.campaignsPacing?.reduce((sum: number, c: any) => sum + (c.creatorsCount || 0), 0) || 0,
            totalVerifiedViews: data.totalVerifiedViews || 0,
            averageCpm: data.averageCpm || 0
          });
        }
      } catch (err) {
        console.error('Failed to load brand performance stats', err);
      }
    };
    fetchBrandMetrics();
  }, [token]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Brand Navigation Tabs */}
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
          onClick={() => setActiveTab('products')}
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-products"
        >
          <Package size={14} /> Products & Briefs
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`btn ${activeTab === 'campaigns' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-campaigns"
        >
          <Layers size={14} /> Campaigns Manager
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`btn ${activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-brand-performance"
        >
          <ShieldCheck size={14} /> CPM Performance Engine
        </button>

        <button
          onClick={() => setActiveTab('creators')}
          className={`btn ${activeTab === 'creators' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-creators"
        >
          <Search size={14} /> Creator Discovery
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-messages"
        >
          <MessageSquare size={14} /> Messages
        </button>

        <button
          onClick={() => setActiveTab('credits')}
          className={`btn ${activeTab === 'credits' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}
          id="tab-brand-credits"
        >
          <Coins size={14} /> Credits & Ledger
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && <ProductsManager />}
      {activeTab === 'campaigns' && <CampaignsManager />}
      {activeTab === 'performance' && <CampaignPerformanceView />}
      {activeTab === 'creators' && <CreatorDiscovery />}
      {activeTab === 'messages' && <MessagingCenter />}
      {activeTab === 'credits' && <WalletLedgerView />}

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Brand Hero Welcome Banner */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderLeft: '4px solid var(--color-brand)' 
          }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="badge badge-verified" style={{ marginBottom: '0.5rem' }}>
                  <Briefcase size={12} /> Active Workspace: Brand
                </div>
                <h2>Welcome, {profile?.companyName || user?.name}</h2>
                <p style={{ marginTop: '0.25rem' }}>
                  {profile?.industry ? `${profile.industry} • ` : ''} 
                  Manage products, run AI-assisted CPM campaigns, and hire verified creators.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onOpenOnboarding} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  Edit Profile
                </button>
                <button onClick={() => setActiveTab('campaigns')} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Launch Campaign
                </button>
              </div>
            </div>
          </div>

          {/* Brand High-Level Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="metric-box" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('credits')}>
              <div className="flex items-center justify-between">
                <span className="metric-label">Credit Balance</span>
                <Coins size={16} color="var(--color-brand)" />
              </div>
              <div className="metric-value">
                {wallet?.balance !== undefined ? wallet.balance.toLocaleString() : '0'}
              </div>
              <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
                Reserved in Escrow: {wallet?.reservedBalance !== undefined ? wallet.reservedBalance.toLocaleString() : '0'}
              </div>
            </div>

            <div className="metric-box" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('campaigns')}>
              <div className="flex items-center justify-between">
                <span className="metric-label">Active Campaigns</span>
                <BarChart3 size={16} color="var(--color-info)" />
              </div>
              <div className="metric-value">
                {brandStats.activeCampaigns}
              </div>
              <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
                {brandStats.totalCampaigns} Total Created
              </div>
            </div>

            <div className="metric-box" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('creators')}>
              <div className="flex items-center justify-between">
                <span className="metric-label">Partnered Creators</span>
                <Users size={16} color="var(--color-brand)" />
              </div>
              <div className="metric-value">
                {brandStats.partneredCreators}
              </div>
              <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
                {brandStats.partneredCreators > 0 ? 'Active Influencer Roster' : 'Browse to Invite Creators'}
              </div>
            </div>

            <div className="metric-box">
              <div className="flex items-center justify-between">
                <span className="metric-label">Total Verified Views</span>
                <TrendingUp size={16} color="var(--color-success)" />
              </div>
              <div className="metric-value">
                {brandStats.totalVerifiedViews >= 1000 
                  ? `${(brandStats.totalVerifiedViews / 1000).toFixed(1)}K` 
                  : brandStats.totalVerifiedViews.toLocaleString()}
              </div>
              <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
                {brandStats.totalVerifiedViews > 0 ? '✓ Platform Verified' : 'Awaiting Content Views'}
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('products')}>
              <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                <Package size={20} color="var(--color-brand)" />
                <h4>Product Definitions</h4>
              </div>
              <p style={{ fontSize: '0.85rem' }}>
                Define products, USPs, target audience, and generate AI brief extractions.
              </p>
            </div>

            <div className="card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('campaigns')}>
              <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                <Layers size={20} color="var(--color-brand)" />
                <h4>Campaigns & Escrow</h4>
              </div>
              <p style={{ fontSize: '0.85rem' }}>
                Deploy CPM campaigns with automatic credit balance reservations.
              </p>
            </div>

            <div className="card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('creators')}>
              <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                <Users size={20} color="var(--color-brand)" />
                <h4>Creator Intelligence</h4>
              </div>
              <p style={{ fontSize: '0.85rem' }}>
                Search verified creators with YouTube historical view statistics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
