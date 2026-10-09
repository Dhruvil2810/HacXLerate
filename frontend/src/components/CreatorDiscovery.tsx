import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { 
  Search, 
  CheckCircle2, 
  Send, 
  X, 
  Wrench, 
  Film, 
  ExternalLink,
  RotateCcw,
  Youtube,
  AlertCircle
} from 'lucide-react';

interface CreatorItem {
  id: string;
  userId: string;
  handle: string;
  bio?: string;
  location?: string;
  categories: string[];
  skills: string[];
  tools: string[];
  contentTypes: string[];
  isVerified: boolean;
  user: {
    name: string;
    avatarUrl?: string | null;
  };
  portfolioItems?: {
    id: string;
    title: string;
    mediaUrl: string;
    thumbnailUrl?: string;
    category?: string;
    toolsUsed?: string[];
  }[];
  socialAccounts?: {
    platform: string;
    accountName: string;
    verificationStatus: string;
    youtubeChannel?: {
      subscriberCount: number | string;
      totalViews: number | string;
      videoCount: number;
    } | null;
  }[];
  aiMatch?: {
    score: number;
    explanation: string;
    consistency: number;
  };
}

const CATEGORIES = ['All', 'Technology', 'AI Film & Animation', 'Product Design', 'Gaming', 'Fashion & Editorial', 'Productivity'];
const AI_TOOLS_FILTER = ['All', 'Midjourney', 'Runway', 'Sora', 'Kling', 'ComfyUI', 'Flux', 'ElevenLabs', 'Pika'];

export const CreatorDiscovery: React.FC = () => {
  const { token } = useAuth();
  const [creators, setCreators] = useState<CreatorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTool, setSelectedTool] = useState('All');
  const [selectedVerified, setSelectedVerified] = useState<string>('All');
  
  // Invite modal state
  const [selectedCreator, setSelectedCreator] = useState<CreatorItem | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('query', searchQuery.trim());
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedTool !== 'All') params.set('tool', selectedTool);
      if (selectedVerified === 'true') params.set('isVerified', 'true');

      const url = `/creators${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await apiRequest<{ creators: CreatorItem[] }>(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.data?.creators) {
        setCreators(res.data.creators);
      } else {
        setCreators([]);
      }
    } catch {
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCreators();
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, selectedTool, selectedVerified]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTool('All');
    setSelectedVerified('All');
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator || !token) return;

    setSendingInvite(true);
    setInviteError(null);

    try {
      // Send direct invitation message
      await apiRequest('/messages/conversations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          recipientUserId: selectedCreator.userId,
          initialMessage: inviteMessage || `Hi @${selectedCreator.handle}, we would love to invite you to collaborate on our upcoming AI creative brief!`,
        }),
      });

      setInviteSuccess(true);
      setTimeout(() => {
        setInviteSuccess(false);
        setSelectedCreator(null);
        setInviteMessage('');
      }, 2000);
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invitation');
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h3>Creator Intelligence & AI Workflow Discovery</h3>
        <p style={{ fontSize: '0.875rem' }}>
          Discover verified AI filmmakers, 3D animators, and generative artists filtered by tools, workflows, and authentic channel metrics.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by creator name, @handle, skills, or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Verification Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Verification:
            </label>
            <select
              value={selectedVerified}
              onChange={(e) => setSelectedVerified(e.target.value)}
              style={{
                padding: '0.55rem 0.75rem',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <option value="All">All Tiers</option>
              <option value="true">Verified Channels Only</option>
            </select>

            {(searchQuery || selectedCategory !== 'All' || selectedTool !== 'All' || selectedVerified !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                title="Reset all filters"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Niche & Content Categories:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* AI Tools Pills */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Generative AI Tools & Models:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {AI_TOOLS_FILTER.map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                className={`btn ${selectedTool === tool ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                <Wrench size={10} /> {tool}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="skeleton" style={{ height: '220px', borderRadius: 'var(--radius-lg)' }}></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && creators.length === 0 && (
        <div className="card" style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          border: '2px dashed var(--border-default)',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <Film size={40} color="var(--color-brand)" style={{ margin: '0 auto 12px' }} />
          <h3>No Creators Found</h3>
          <p style={{ maxWidth: '450px', margin: '0.5rem auto 1.5rem', fontSize: '0.875rem' }}>
            No creator profiles match your active filters. Try clearing your search filters or invite creators to join your campaign.
          </p>
          <button onClick={handleResetFilters} className="btn btn-secondary">
            <RotateCcw size={14} /> Clear All Filters
          </button>
        </div>
      )}

      {/* Creator Grid */}
      {!loading && creators.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {creators.map((creator) => {
            const yt = creator.socialAccounts?.find((s) => s.platform === 'YOUTUBE')?.youtubeChannel;
            const subs = yt ? Number(yt.subscriberCount).toLocaleString() : null;
            const totalViews = yt ? Number(yt.totalViews).toLocaleString() : null;

            return (
              <div key={creator.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Header Profile Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-brand-light)',
                      color: 'var(--color-brand)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}>
                      {creator.user.name ? creator.user.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 style={{ fontSize: '1.05rem' }}>{creator.user.name}</h4>
                        {creator.isVerified && (
                          <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
                            <CheckCircle2 size={11} /> Verified
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        @{creator.handle} {creator.location && `• ${creator.location}`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCreator(creator)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    <Send size={13} /> Invite
                  </button>
                </div>

                {/* Bio */}
                {creator.bio && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {creator.bio}
                  </p>
                )}

                {/* AI Tools & Skills Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {creator.tools && creator.tools.map((tool) => (
                    <span
                      key={tool}
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--color-brand)',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Wrench size={10} /> {tool}
                    </span>
                  ))}
                  {creator.categories && creator.categories.map((cat) => (
                    <span
                      key={cat}
                      className="badge badge-neutral"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Verified YouTube Channel Stats if available */}
                {yt && (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                  }}>
                    <div className="flex items-center gap-1.5" style={{ color: '#dc2626', fontWeight: 600 }}>
                      <Youtube size={15} /> YouTube Metrics
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <strong>{subs}</strong> Subscribers • <strong>{totalViews}</strong> Channel Views
                    </div>
                  </div>
                )}

                {/* Portfolio Showcase Snippet */}
                {creator.portfolioItems && creator.portfolioItems.length > 0 && (
                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Recent AI Portfolio Projects:
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {creator.portfolioItems.map((p) => (
                        <a
                          key={p.id}
                          href={p.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-brand)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            backgroundColor: 'var(--bg-subtle)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <Film size={11} /> {p.title}
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      {selectedCreator && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <div style={{
                  padding: '0.4rem',
                  backgroundColor: 'var(--color-brand-light)',
                  color: 'var(--color-brand)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <Send size={18} />
                </div>
                <div>
                  <h3>Invite @{selectedCreator.handle}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Send a direct project collaboration invitation.
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedCreator(null)} className="btn btn-secondary" style={{ padding: '0.3rem' }}>
                <X size={16} />
              </button>
            </div>

            {inviteSuccess && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--color-success-light)',
                color: 'var(--color-success)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <CheckCircle2 size={16} />
                Invitation message delivered to creator!
              </div>
            )}

            {inviteError && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <AlertCircle size={16} />
                {inviteError}
              </div>
            )}

            <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Project Invitation Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={`Hi @${selectedCreator.handle}, we loved your AI portfolio and would like to invite you to our latest creative brief...`}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setSelectedCreator(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInvite}
                  className="btn btn-primary"
                  id="btn-confirm-send-invite"
                >
                  {sendingInvite ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
