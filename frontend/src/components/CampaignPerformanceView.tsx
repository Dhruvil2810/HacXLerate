import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { 
  TrendingUp, 
  Coins, 
  CheckCircle2, 
  Play, 
  RotateCw, 
  Trophy, 
  Youtube, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Plus,
  Video
} from 'lucide-react';

interface PublishedContentItem {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar?: string;
  platform: string;
  publishedUrl: string;
  externalContentId: string;
  status: string;
  initialViews: number;
  currentViews: number;
  incrementalViews: number;
  earnedCredits: number;
  publishedAt: string;
  lastSyncedAt?: string;
  snapshots: {
    id: string;
    timestamp: string;
    views: number;
    incrementalViews: number;
    likes: number;
    comments: number;
    sourceType: string;
  }[];
}

interface LeaderboardItem {
  creatorId: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  isVerified: boolean;
  totalIncrementalViews: number;
  earnedCredits: number;
  effectiveCpm: number;
  contentCount: number;
  status: string;
}

interface CampaignPerformanceViewProps {
  campaignId?: string;
  campaignTitle?: string;
  cpmRate?: number;
  budgetCredits?: number;
  onOpenSubmitModal?: () => void;
}

export const CampaignPerformanceView: React.FC<CampaignPerformanceViewProps> = ({
  campaignId = 'active_campaign',
  campaignTitle = 'Active Performance Campaign',
  cpmRate = 65,
  budgetCredits = 4500,
  onOpenSubmitModal,
}) => {
  const { user, token } = useAuth();
  const activeRole = user?.activeRole;
  const [contents, setContents] = useState<PublishedContentItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) {
      setContents([]);
      setLeaderboard([]);
      return;
    }

    setLoading(true);
    try {
      const [contentsRes, leaderboardRes] = await Promise.all([
        apiRequest<PublishedContentItem[]>(`/performance/content/campaign/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        apiRequest<{ leaderboard: LeaderboardItem[] }>(`/performance/campaign/${campaignId}/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (contentsRes?.data && Array.isArray(contentsRes.data)) {
        setContents(contentsRes.data);
      } else {
        setContents([]);
      }

      if (leaderboardRes?.data?.leaderboard && Array.isArray(leaderboardRes.data.leaderboard)) {
        setLeaderboard(leaderboardRes.data.leaderboard);
      } else {
        setLeaderboard([]);
      }
    } catch {
      setContents([]);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [campaignId, token]);

  const handleRunEvaluation = async (contentId: string) => {
    setEvaluatingId(contentId);
    setActionMessage(null);

    try {
      if (token) {
        const res = await apiRequest<{ payoutDistributed: number; incrementalViews: number; totalEarned: number }>(
          `/performance/content/${contentId}/evaluate`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ simulatedViews: undefined }),
          }
        );

        if (res.data) {
          setActionMessage(`✓ Snapshot verified! Distributed ${res.data.payoutDistributed} credits. Total incremental views: ${res.data.incrementalViews.toLocaleString()}.`);
        }
      }

      fetchData();
    } catch (err: any) {
      setActionMessage(`Error evaluating performance: ${err.message || 'Unknown error'}`);
    } finally {
      setEvaluatingId(null);
    }
  };

  const totalIncrementalViews = contents.reduce((acc, curr) => acc + curr.incrementalViews, 0);
  const totalEarnedCredits = contents.reduce((acc, curr) => acc + curr.earnedCredits, 0);
  const remainingEscrow = Math.max(0, budgetCredits - totalEarnedCredits);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Campaign Performance Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderLeft: '4px solid var(--color-brand)',
      }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
              <span className="badge badge-verified">
                <ShieldCheck size={12} /> Live Performance Tracking Engine
              </span>
              <span className="badge badge-verified">
                <Youtube size={12} /> YouTube Analytics Connected
              </span>
            </div>
            <h2>{campaignTitle}</h2>
            <p style={{ marginTop: '0.25rem' }}>
              Reward Model: <strong>Deterministic CPM (₹{cpmRate} per 1,000 Verified Views)</strong> • Total Escrow: <strong>{budgetCredits.toLocaleString()} Credits</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn btn-secondary"
              style={{ fontSize: '0.825rem' }}
            >
              <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh Analytics
            </button>
            {activeRole === 'CREATOR' && onOpenSubmitModal && (
              <button
                onClick={onOpenSubmitModal}
                className="btn btn-primary"
                style={{ fontSize: '0.825rem' }}
                id="btn-open-submit-content"
              >
                <Plus size={14} /> Submit Video Link
              </button>
            )}
          </div>
        </div>
      </div>

      {actionMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-success-light)',
          color: 'var(--color-success)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          border: '1px solid var(--color-success-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle2 size={16} />
          {actionMessage}
        </div>
      )}

      {/* Aggregate Performance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Incremental Verified Views</span>
            <TrendingUp size={16} color="var(--color-success)" />
          </div>
          <div className="metric-value">
            {totalIncrementalViews.toLocaleString()}
          </div>
          <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
            &Delta; Views over publication baseline
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Escrow Distributed (CPM)</span>
            <Coins size={16} color="var(--color-brand)" />
          </div>
          <div className="metric-value">
            {totalEarnedCredits.toLocaleString()}
          </div>
          <div className="metric-delta" style={{ color: 'var(--color-brand)' }}>
            {budgetCredits > 0 ? ((totalEarnedCredits / budgetCredits) * 100).toFixed(1) : 0}% of campaign escrow
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Remaining Escrow Balance</span>
            <Coins size={16} color="var(--color-info)" />
          </div>
          <div className="metric-value">
            {remainingEscrow.toLocaleString()}
          </div>
          <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
            Safely held in Brand escrow
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Active Published Tracks</span>
            <Play size={16} color="var(--color-warning)" />
          </div>
          <div className="metric-value">
            {contents.length}
          </div>
          <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
            Live Incremental Tracking
          </div>
        </div>
      </div>

      {/* Published Content Tracks & Evaluation Engine */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h3>Active Content Tracking & Verified Payout Engine</h3>
            <p style={{ fontSize: '0.85rem' }}>
              Views are measured against initial submission baseline ($V_0$). Escrow releases directly to creator wallets via immutable ledger.
            </p>
          </div>
          <span className="badge badge-verified">
            <ShieldCheck size={12} /> Auto Escrow Distribution
          </span>
        </div>

        {contents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            border: '2px dashed var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-subtle)'
          }}>
            <Video size={36} color="var(--color-brand)" style={{ margin: '0 auto 10px' }} />
            <h4>No Content Submitted for Tracking Yet</h4>
            <p style={{ maxWidth: '440px', margin: '0.35rem auto 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Participating creators submit their published YouTube video URLs to initiate automated baseline and incremental view reward tracking.
            </p>
            {activeRole === 'CREATOR' && onOpenSubmitModal && (
              <button onClick={onOpenSubmitModal} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <Plus size={14} /> Submit Video Link
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Creator & Video ID</th>
                  <th>Baseline Views ($V_0$)</th>
                  <th>Current Verified Views</th>
                  <th>&Delta; Incremental Views</th>
                  <th>CPM Earned Payout</th>
                  <th>Status</th>
                  <th>Live Verification Action</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <div className="flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                          <Youtube size={14} color="#dc2626" />
                          @{item.creatorHandle}
                        </div>
                        <a
                          href={item.publishedUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-brand)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            marginTop: '0.15rem',
                          }}
                        >
                          <code>{item.externalContentId}</code>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </td>
                    <td>
                      <code>{item.initialViews.toLocaleString()}</code>
                    </td>
                    <td>
                      <strong>{item.currentViews.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                        +{item.incrementalViews.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-brand)' }}>
                        {item.earnedCredits.toLocaleString()} Credits
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        ₹{cpmRate} CPM
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-verified">
                        <CheckCircle2 size={10} /> {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleRunEvaluation(item.id)}
                        disabled={evaluatingId === item.id}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                        id={`btn-evaluate-${item.id}`}
                      >
                        <RotateCw size={12} className={evaluatingId === item.id ? 'animate-spin' : ''} />
                        {evaluatingId === item.id ? 'Evaluating...' : 'Ingest Snapshot & Pay'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Leaderboard & Time-Series Snapshot History */}
      <div className="grid grid-cols-2 gap-4">
        {/* Creator Leaderboard */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={18} color="var(--color-brand)" />
              <h4>Campaign Creator Leaderboard</h4>
            </div>
            <span className="badge badge-verified">Ranked by &Delta; Views</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Leaderboard will update once creators submit published content.
              </div>
            ) : (
              leaderboard.map((creator, idx) => (
                <div
                  key={creator.creatorId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: idx === 0 ? '1px solid var(--color-brand-light)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: idx === 0 ? 'var(--color-brand)' : 'var(--border-default)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        @{creator.handle}
                        {creator.isVerified && <CheckCircle2 size={12} color="var(--color-brand)" />}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {creator.name} • {creator.contentCount} video(s)
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.875rem' }}>
                      +{creator.totalIncrementalViews.toLocaleString()} Views
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-brand)', fontWeight: 600 }}>
                      {creator.earnedCredits.toLocaleString()} Credits Earned
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Time-Series Snapshots Feed */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h4>Point-in-Time Verified Snapshot Log</h4>
            <span className="badge badge-verified">
              <ShieldCheck size={11} /> PLATFORM_VERIFIED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {contents.length > 0 && contents[0].snapshots && contents[0].snapshots.length > 0 ? (
              contents[0].snapshots.map((snap) => (
                <div
                  key={snap.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{snap.timestamp}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Total: {snap.views.toLocaleString()} • Likes: {snap.likes.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-verified" style={{ fontSize: '0.75rem' }}>
                      +{(snap.incrementalViews || 0).toLocaleString()} &Delta; Views
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <AlertCircle size={24} style={{ margin: '0 auto 6px' }} />
                No snapshot events logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
