import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProductsManager } from './ProductsManager';
import { CampaignsManager } from './CampaignsManager';
import { CreatorDiscovery } from './CreatorDiscovery';
import { MessagingCenter } from './MessagingCenter';
import { WalletLedgerView } from './WalletLedgerView';
import { CampaignPerformanceView } from './CampaignPerformanceView';
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
  const { user } = useAuth();
  const profile = user?.brandProfile;
  const wallet = user?.creditWallet;
  const [activeTab, setActiveTab] = useState<BrandTab>('overview');

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
                {wallet?.balance.toLocaleString() || '5,000'}
              </div>
              <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
                Reserved in Escrow: {wallet?.reservedBalance || '0'}
              </div>
            </div>

            <div className="metric-box" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('campaigns')}>
              <div className="flex items-center justify-between">
                <span className="metric-label">Active Campaigns</span>
                <BarChart3 size={16} color="var(--color-info)" />
              </div>
              <div className="metric-value">
                2
              </div>
              <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
                +1 Scheduled
              </div>
            </div>

            <div className="metric-box" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('creators')}>
              <div className="flex items-center justify-between">
                <span className="metric-label">Partnered Creators</span>
                <Users size={16} color="var(--color-brand)" />
              </div>
              <div className="metric-value">
                8
              </div>
              <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
                3 Pending Applications
              </div>
            </div>

            <div className="metric-box">
              <div className="flex items-center justify-between">
                <span className="metric-label">Total Verified Views</span>
                <TrendingUp size={16} color="var(--color-success)" />
              </div>
              <div className="metric-value">
                245.8K
              </div>
              <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
                ✓ Platform Verified
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
