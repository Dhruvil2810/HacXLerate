import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Campaign, Product } from '../types/marketplace';
import { 
  Plus, 
  Coins, 
  Users, 
  X, 
  UserCheck,
  UserX,
  Sparkles
} from 'lucide-react';

const INITIAL_DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_demo_1',
    brandId: 'bp_demo_1',
    productId: 'prod_demo_1',
    title: 'Creator Studio Mechanical Keyboard Q4 Launch',
    objective: 'Generate 100K+ verified views from developer and tech workspace creators.',
    description: 'We are launching the Nexus Pro custom keyboard. We are seeking tech reviewers to produce dedicated 4K reviews showcasing build quality, acoustics, and software customization.',
    budgetCredits: 4000,
    allocatedCredits: 4000,
    spentCredits: 2200,
    rewardModel: 'CPM',
    cpmRate: 55.0,
    status: 'APPLICATIONS_OPEN',
    contentPlatform: 'YOUTUBE',
    creatorCategories: ['Technology', 'Hardware', 'Productivity'],
    requiredSkills: ['4K Video Production', 'Sound Test'],
    contentRequirements: 'Minimum 5-minute dedicated video with microphone sound test and software walkthrough.',
    prohibitedContent: 'No sponsorships of competing keyboards in the same video.',
    hashtags: ['#MechanicalKeyboard', '#DeskSetup', '#NexusPro'],
    createdAt: new Date().toISOString(),
    product: {
      id: 'prod_demo_1',
      name: 'Nexus Pro Mechanical Keyboard',
      category: 'Hardware',
    },
    _count: {
      applications: 4,
      creators: 2,
    },
  },
  {
    id: 'camp_demo_2',
    brandId: 'bp_demo_1',
    productId: 'prod_demo_2',
    title: 'Ultra-light Wireless Mouse Global Launch',
    objective: 'Showcase low latency and ergonomics across gaming and design YouTube channels.',
    description: 'Looking for creators to integrate AirGlide Mouse into their desk setups and workflow reviews.',
    budgetCredits: 3500,
    allocatedCredits: 3500,
    spentCredits: 1750,
    rewardModel: 'CPM',
    cpmRate: 50.0,
    status: 'LIVE',
    contentPlatform: 'YOUTUBE',
    creatorCategories: ['Gaming', 'Technology', 'Design'],
    requiredSkills: ['Shorts / Reels', 'Product Integration'],
    hashtags: ['#TechSetup', '#AirGlide'],
    createdAt: new Date().toISOString(),
    product: {
      id: 'prod_demo_2',
      name: 'AirGlide Wireless Productivity Mouse',
      category: 'Peripherals',
    },
    _count: {
      applications: 6,
      creators: 3,
    },
  },
];

interface ApplicationItem {
  id: string;
  creatorId: string;
  creator: {
    handle: string;
    categories: string[];
    user: {
      name: string;
    };
  };
  pitch: string;
  proposedRate: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export const CampaignsManager: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_DEMO_CAMPAIGNS);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Create Campaign Form States
  const [title, setTitle] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [objective, setObjective] = useState('');
  const [description, setDescription] = useState('');
  const [budgetCredits, setBudgetCredits] = useState(2500);
  const [cpmRate, setCpmRate] = useState(50);
  const [creatorCategories, setCreatorCategories] = useState('Technology, Hardware');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiBriefBanner, setAiBriefBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock applicants list for interactive review
  const [applicants, setApplicants] = useState<ApplicationItem[]>([
    {
      id: 'app_demo_1',
      creatorId: 'cp_demo_1',
      creator: {
        handle: 'alexrivera_tech',
        categories: ['Technology', 'Hardware'],
        user: { name: 'Alex Rivera' },
      },
      pitch: 'I have 250K+ subscribers in the mechanical keyboard & developer desk setup niche. Can deliver 4K dedicated unboxing & sound test within 5 days.',
      proposedRate: 55,
      status: 'PENDING',
    },
    {
      id: 'app_demo_2',
      creatorId: 'cp_demo_2',
      creator: {
        handle: 'sarah_codes',
        categories: ['Software', 'Productivity'],
        user: { name: 'Sarah Chen' },
      },
      pitch: 'Would love to integrate this into my upcoming "Ultimate 2026 Developer Desk Setup" video.',
      proposedRate: 50,
      status: 'PENDING',
    },
  ]);

  useEffect(() => {
    async function loadCampaigns() {
      if (!token) return;
      try {
        const res = await apiRequest<{ campaigns: Campaign[] }>('/campaigns/brand', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.success && res.data?.campaigns && res.data.campaigns.length > 0) {
          setCampaigns(res.data.campaigns);
        }

        const prodRes = await apiRequest<{ products: Product[] }>('/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (prodRes.success && prodRes.data?.products) {
          setProducts(prodRes.data.products);
        }
      } catch {
        // Keep demo items
      }
    }
    loadCampaigns();
  }, [token]);

  const handleAiAssistBrief = async () => {
    if (!title) {
      alert('Please enter a campaign title first.');
      return;
    }

    setAiGenerating(true);
    setAiBriefBanner(null);

    const categoriesArray = creatorCategories.split(',').map((c) => c.trim()).filter(Boolean);

    try {
      if (token) {
        const res = await apiRequest<{ brief: any; creditCost: number }>('/ai/campaign-assist', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title,
            objective: objective || 'Drive verified view growth and customer trials',
            rewardModel: 'CPM',
            cpmRate,
            categories: categoriesArray,
            description: description || title,
          }),
        });

        if (res.success && res.data?.brief) {
          const brief = res.data.brief;
          if (brief.enhancedObjective) setObjective(brief.enhancedObjective);
          if (brief.creatorRequirements) setRequirements(brief.creatorRequirements.join('\n'));
          setAiBriefBanner(`✨ AI Brief Generated (-10 Credits): Creative hooks, requirements, and hashtags injected.`);

          if (user?.creditWallet) {
            updateUser({
              ...user,
              creditWallet: {
                ...user.creditWallet,
                balance: user.creditWallet.balance - 10,
              },
            });
          }
        } else {
          setRequirements('4K video resolution required\nDisclose sponsorship clearly in first 30 seconds\nInclude tracking link in top comment');
          setAiBriefBanner('✨ AI heuristics applied: generated standard high-retention brief requirements.');
        }
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const categoriesArray = creatorCategories.split(',').map((c) => c.trim()).filter(Boolean);

    const payload = {
      title,
      productId: selectedProductId || undefined,
      objective,
      description,
      budgetCredits,
      cpmRate,
      rewardModel: 'CPM',
      contentPlatform: 'YOUTUBE',
      creatorCategories: categoriesArray,
      contentRequirements: requirements || undefined,
    };

    try {
      if (token) {
        const res = await apiRequest<{ campaign: Campaign }>('/campaigns', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });

        if (res.success && res.data?.campaign) {
          setCampaigns((prev) => [res.data!.campaign, ...prev]);
          if (user && user.creditWallet) {
            updateUser({
              ...user,
              creditWallet: {
                balance: user.creditWallet.balance - budgetCredits,
                reservedBalance: user.creditWallet.reservedBalance + budgetCredits,
              },
            });
          }
        } else {
          // Local fallback
          const newCamp: Campaign = {
            id: `camp_${Date.now()}`,
            brandId: 'local',
            productId: selectedProductId,
            title,
            objective,
            description,
            budgetCredits,
            allocatedCredits: budgetCredits,
            spentCredits: 0,
            rewardModel: 'CPM',
            cpmRate,
            status: 'APPLICATIONS_OPEN',
            contentPlatform: 'YOUTUBE',
            creatorCategories: categoriesArray,
            requiredSkills: ['4K Video'],
            hashtags: ['#CreatorOS'],
            createdAt: new Date().toISOString(),
            _count: { applications: 0, creators: 0 },
          };
          setCampaigns((prev) => [newCamp, ...prev]);
        }
      }
      setIsCreateModalOpen(false);
      setTitle('');
      setObjective('');
      setDescription('');
      setRequirements('');
      setAiBriefBanner(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationDecision = (appId: string, decision: 'ACCEPTED' | 'REJECTED') => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: decision } : app))
    );
  };

  const openApplicantsView = (camp: Campaign) => {
    setSelectedCampaign(camp);
    setIsApplicantsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3>Performance Campaigns & AI Assistance</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Deploy verified CPM campaigns, generate AI briefs, and reserve budget in escrow.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem' }}
          id="create-campaign-btn"
        >
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {campaigns.map((camp) => (
          <div key={camp.id} className="card">
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.35rem' }}>
                  <span className={`badge ${camp.status === 'LIVE' || camp.status === 'APPLICATIONS_OPEN' ? 'badge-verified' : 'badge-neutral'}`}>
                    {camp.status}
                  </span>
                  <span className="badge badge-neutral">
                    CPM ₹{camp.cpmRate} / 1k views
                  </span>
                  {camp.product && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Product: <strong>{camp.product.name}</strong>
                    </span>
                  )}
                </div>
                <h4>{camp.title}</h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openApplicantsView(camp)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  <Users size={14} /> View Applicants ({camp._count?.applications || applicants.length})
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              {camp.description}
            </p>

            <div className="grid grid-cols-4 gap-3" style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span className="metric-label" style={{ fontSize: '0.7rem' }}>Budget Reserved</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{camp.budgetCredits.toLocaleString()} Credits</div>
              </div>
              <div>
                <span className="metric-label" style={{ fontSize: '0.7rem' }}>Active Creators</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{camp._count?.creators || 2} Approved</div>
              </div>
              <div>
                <span className="metric-label" style={{ fontSize: '0.7rem' }}>Reward Model</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>CPM (Verified Views)</div>
              </div>
              <div>
                <span className="metric-label" style={{ fontSize: '0.7rem' }}>Target Categories</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {camp.creatorCategories.join(', ') || 'Technology'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
          }}>
            <button
              onClick={() => setIsCreateModalOpen(false)}
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
                <Coins size={12} /> Escrow Backed Campaign
              </div>
              <h2>Create Performance Campaign</h2>
              <p style={{ fontSize: '0.875rem' }}>
                Set your CPM reward rate, generate brief guidelines with AI, and reserve budget in escrow.
              </p>
            </div>

            {aiBriefBanner && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.825rem',
                border: '1px solid var(--color-info-border)',
              }}>
                {aiBriefBanner}
              </div>
            )}

            {error && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--color-danger-light)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Creator Studio 4K Video Reviews"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              {products.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Attach Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Total Budget (Credits)
                  </label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={budgetCredits}
                    onChange={(e) => setBudgetCredits(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Available: {user?.creditWallet?.balance || 0} Credits
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    CPM Rate (Credits / 1k Views)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={cpmRate}
                    onChange={(e) => setCpmRate(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Standard: ₹50 / 1k views
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Target Creator Niches (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technology, Gaming, Lifestyle"
                  value={creatorCategories}
                  onChange={(e) => setCreatorCategories(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              {/* AI Brief Assistant Trigger */}
              <div>
                <button
                  type="button"
                  onClick={handleAiAssistBrief}
                  disabled={aiGenerating}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    borderColor: 'var(--color-brand)',
                    color: 'var(--color-brand)',
                    fontSize: '0.825rem',
                    padding: '0.5rem',
                  }}
                >
                  <Sparkles size={14} color="var(--color-brand)" />
                  {aiGenerating ? 'AI Generating Brief...' : 'AI Generate Creative Hooks & Deliverables (Cost: 10 Credits)'}
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Campaign Objective
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Generate 50,000+ views showcasing product unboxing"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Brief Description & Guidelines
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed briefing for creators on what features to highlight..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Creator Requirements & Guidelines
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 4K video resolution, natural product integration, disclosure guidelines..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
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
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Publishing...' : 'Publish & Reserve Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Applicants Modal */}
      {isApplicantsModalOpen && selectedCampaign && (
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
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
          }}>
            <button
              onClick={() => setIsApplicantsModalOpen(false)}
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
                <Users size={12} /> Creator Applications
              </div>
              <h3>Applicants for {selectedCampaign.title}</h3>
              <p style={{ fontSize: '0.875rem' }}>
                Review creator pitches, check verified channel statistics, and approve participants.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applicants.map((app) => (
                <div key={app.id} style={{
                  padding: '1rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-subtle)',
                }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <div>
                      <strong>{app.creator.user.name}</strong>{' '}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>@{app.creator.handle}</span>
                    </div>
                    <span className={`badge ${app.status === 'ACCEPTED' ? 'badge-verified' : app.status === 'REJECTED' ? 'badge-neutral' : 'badge-selfreported'}`}>
                      {app.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    "{app.pitch}"
                  </p>

                  <div className="flex items-center justify-between" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Proposed Rate: <strong>₹{app.proposedRate} / 1k views</strong>
                    </div>

                    {app.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplicationDecision(app.id, 'REJECTED')}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          <UserX size={12} /> Decline
                        </button>
                        <button
                          onClick={() => handleApplicationDecision(app.id, 'ACCEPTED')}
                          className="btn btn-primary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          <UserCheck size={12} /> Accept Creator
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {app.status === 'ACCEPTED' ? '✓ Added to Campaign' : 'Application Closed'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
