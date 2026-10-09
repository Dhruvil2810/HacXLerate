import React, { useState } from 'react';
import { CreatorCard } from '../types/marketplace';
import { 
  Search, 
  CheckCircle2, 
  Send, 
  X, 
  MapPin, 
  Tag,
  Sparkles
} from 'lucide-react';

const DEMO_CREATORS: (CreatorCard & { aiMatch?: { score: number; explanation: string; consistency: number } })[] = [
  {
    id: 'cp_demo_1',
    userId: 'usr_demo_1',
    handle: 'alexrivera_tech',
    bio: 'In-depth mechanical keyboard reviews, desk setups, and developer workstation benchmarks. 250K+ subscribers.',
    location: 'San Francisco, CA',
    categories: ['Technology', 'Hardware', 'Productivity'],
    skills: ['4K Video Production', 'Sound Test', 'Shorts'],
    isVerified: true,
    user: {
      name: 'Alex Rivera',
      avatarUrl: null,
    },
    aiMatch: {
      score: 94.2,
      consistency: 91,
      explanation: 'Exceptional audience fit with 250K+ tech and keyboard enthusiasts; historical video consistency shows predictable view delivery.',
    },
    socialAccounts: [
      {
        platform: 'YOUTUBE',
        accountName: 'Alex Rivera Tech',
        verificationStatus: 'VERIFIED',
        youtubeChannel: {
          subscriberCount: 265000,
          totalViews: 14200000,
          videoCount: 142,
        },
      },
    ],
    portfolioItems: [
      {
        id: 'port_1',
        title: 'Custom Gasket Mount Keyboard Showcase',
        mediaUrl: 'https://youtube.com/watch?v=demo1',
        category: 'Hardware',
      },
    ],
  },
  {
    id: 'cp_demo_2',
    userId: 'usr_demo_2',
    handle: 'sarah_codes',
    bio: 'Software engineer sharing productivity workflows, SaaS reviews, and coding tutorials.',
    location: 'Seattle, WA',
    categories: ['Software', 'Education', 'Technology'],
    skills: ['SaaS Reviews', 'Screen Recordings', 'Tutorials'],
    isVerified: true,
    user: {
      name: 'Sarah Chen',
      avatarUrl: null,
    },
    aiMatch: {
      score: 88.6,
      consistency: 85,
      explanation: 'High engagement among developer audiences; strong alignment for productivity tooling and workflow integrations.',
    },
    socialAccounts: [
      {
        platform: 'YOUTUBE',
        accountName: 'Sarah Codes',
        verificationStatus: 'VERIFIED',
        youtubeChannel: {
          subscriberCount: 185000,
          totalViews: 8900000,
          videoCount: 98,
        },
      },
    ],
  },
  {
    id: 'cp_demo_3',
    userId: 'usr_demo_3',
    handle: 'marcus_gaming',
    bio: 'Competitive gamer testing low-latency peripherals, gaming mice, and audio equipment.',
    location: 'Austin, TX',
    categories: ['Gaming', 'Hardware'],
    skills: ['Gameplay Integration', 'Unboxing', 'Shorts'],
    isVerified: false,
    user: {
      name: 'Marcus Vance',
      avatarUrl: null,
    },
    aiMatch: {
      score: 81.4,
      consistency: 78,
      explanation: 'Solid gaming peripherals overlap with strong short-form unboxing metrics.',
    },
    socialAccounts: [
      {
        platform: 'YOUTUBE',
        accountName: 'Marcus Gaming Lab',
        verificationStatus: 'SELF_REPORTED',
        youtubeChannel: {
          subscriberCount: 94000,
          totalViews: 4200000,
          videoCount: 75,
        },
      },
    ],
  },
];

const CATEGORIES = ['All', 'Technology', 'Hardware', 'Software', 'Gaming', 'Productivity'];

export const CreatorDiscovery: React.FC = () => {
  const [creators] = useState(DEMO_CREATORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCreator, setSelectedCreator] = useState<typeof DEMO_CREATORS[0] | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [invitedSuccess, setInvitedSuccess] = useState(false);

  const filteredCreators = creators.filter((c) => {
    const matchesCategory =
      selectedCategory === 'All' || c.categories.includes(selectedCategory);
    const matchesSearch =
      c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.bio && c.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInvitedSuccess(true);
    setTimeout(() => {
      setInvitedSuccess(false);
      setSelectedCreator(null);
      setInviteMessage('');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3>Creator Intelligence & AI Match Reasoning</h3>
        <p style={{ fontSize: '0.875rem' }}>
          Deterministic multi-factor creator scores powered by OpenRouter AI semantic fit reasoning.
        </p>
      </div>

      {/* Search & Category Filter Header */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by name, handle, or skills..."
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

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                border: selectedCategory === cat ? '1px solid var(--color-brand)' : '1px solid var(--border-default)',
                backgroundColor: selectedCategory === cat ? 'var(--color-brand-light)' : 'var(--bg-surface)',
                color: selectedCategory === cat ? 'var(--color-brand)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Creator Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredCreators.map((creator) => {
          const yt = creator.socialAccounts?.[0]?.youtubeChannel;
          const isVerified = creator.socialAccounts?.[0]?.verificationStatus === 'VERIFIED';

          return (
            <div key={creator.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center gap-2">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-brand-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-brand)',
                      fontWeight: 700,
                    }}>
                      {creator.user.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{creator.user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{creator.handle}</div>
                    </div>
                  </div>

                  <span className={`badge ${isVerified ? 'badge-verified' : 'badge-selfreported'}`}>
                    {isVerified ? (
                      <>
                        <CheckCircle2 size={12} /> Verified
                      </>
                    ) : (
                      '⚠ Self Reported'
                    )}
                  </span>
                </div>

                {/* AI Match Score Badge & Explanation */}
                {creator.aiMatch && (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--color-brand-light)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    border: '1px solid var(--color-info-border)',
                  }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-brand)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={13} /> {creator.aiMatch.score}% Deterministic Match
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--color-success)', fontWeight: 600 }}>
                        {creator.aiMatch.consistency}% Consistency
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.35', margin: 0 }}>
                      {creator.aiMatch.explanation}
                    </p>
                  </div>
                )}

                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1rem' }}>
                  {creator.bio}
                </p>

                {creator.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <MapPin size={12} /> {creator.location}
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                  {creator.categories.map((cat) => (
                    <span key={cat} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      <Tag size={10} /> {cat}
                    </span>
                  ))}
                </div>

                {yt && (
                  <div className="grid grid-cols-2 gap-2" style={{ padding: '0.5rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subscribers</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {Number(yt.subscriberCount).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Channel Views</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {(Number(yt.totalViews) / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setSelectedCreator(creator)}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem' }}
                >
                  <Send size={14} /> Invite to Campaign
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Modal */}
      {selectedCreator && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            position: 'relative',
          }}>
            <button
              onClick={() => setSelectedCreator(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <div className="badge badge-verified" style={{ marginBottom: '0.5rem' }}>
                <Send size={12} /> Direct Invitation
              </div>
              <h3>Invite @{selectedCreator.handle}</h3>
              <p style={{ fontSize: '0.875rem' }}>
                Send a personalized campaign invitation to {selectedCreator.user.name}.
              </p>
            </div>

            {invitedSuccess ? (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-success-light)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-success)',
                fontWeight: 600,
              }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                Invitation sent successfully!
              </div>
            ) : (
              <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Select Campaign
                  </label>
                  <select
                    required
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="camp_1">Creator Studio Mechanical Keyboard Q4 (CPM ₹55)</option>
                    <option value="camp_2">AirGlide Wireless Mouse Launch (CPM ₹50)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Personal Note / Pitch
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="We love your recent desk setup videos and would love to partner with you for our upcoming product launch..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCreator(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
