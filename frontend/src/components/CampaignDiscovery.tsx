import React, { useState } from 'react';
import { Campaign } from '../types/marketplace';
import { 
  Search, 
  Briefcase, 
  Send, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Tag
} from 'lucide-react';

const MARKETPLACE_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_m1',
    brandId: 'bp_demo_1',
    title: 'Creator Studio Mechanical Keyboard Q4 Launch',
    objective: 'Showcase build quality and sound tests across 4K developer & gaming videos.',
    description: 'We are seeking tech reviewers to produce dedicated 4K reviews showcasing build quality, acoustics, and software customization for our flagship wireless keyboard.',
    budgetCredits: 4000,
    allocatedCredits: 4000,
    spentCredits: 2200,
    rewardModel: 'CPM',
    cpmRate: 55.0,
    status: 'APPLICATIONS_OPEN',
    contentPlatform: 'YOUTUBE',
    creatorCategories: ['Technology', 'Hardware', 'Productivity'],
    requiredSkills: ['4K Video Production', 'Sound Test'],
    contentRequirements: '5+ min dedicated review highlighting gasket mount & custom software.',
    hashtags: ['#MechanicalKeyboard', '#NexusPro'],
    createdAt: new Date().toISOString(),
    brand: {
      companyName: 'Nexus Tech Labs',
      industry: 'Consumer Electronics',
    },
    product: {
      id: 'p1',
      name: 'Nexus Pro Mechanical Keyboard',
      category: 'Hardware',
    },
    _count: { applications: 4, creators: 2 },
  },
  {
    id: 'camp_m2',
    brandId: 'bp_demo_2',
    title: 'Ergonomic Standing Desk 2026 Showcase',
    objective: 'Feature motorized smart desk in workspace setup & developer productivity videos.',
    description: 'Looking for creators to demonstrate cable management, memory presets, and dual-motor stability.',
    budgetCredits: 5000,
    allocatedCredits: 5000,
    spentCredits: 1200,
    rewardModel: 'CPM',
    cpmRate: 60.0,
    status: 'APPLICATIONS_OPEN',
    contentPlatform: 'YOUTUBE',
    creatorCategories: ['Productivity', 'Technology', 'Lifestyle'],
    requiredSkills: ['Desk Setup', 'Cinematic B-Roll'],
    hashtags: ['#DeskSetup', '#StandingDesk'],
    createdAt: new Date().toISOString(),
    brand: {
      companyName: 'Zenith Workspace',
      industry: 'Furniture & Ergonomics',
    },
    product: {
      id: 'p2',
      name: 'Zenith Pro Smart Desk',
      category: 'Hardware',
    },
    _count: { applications: 7, creators: 3 },
  },
  {
    id: 'camp_m3',
    brandId: 'bp_demo_3',
    title: 'Cloud Developer IDE Extension Launch',
    objective: 'Explain AI-assisted cloud deployment tools to developer audiences.',
    description: 'Seeking software engineering YouTube creators to show workflow integration with VS Code.',
    budgetCredits: 3000,
    allocatedCredits: 3000,
    spentCredits: 800,
    rewardModel: 'CPM',
    cpmRate: 65.0,
    status: 'APPLICATIONS_OPEN',
    contentPlatform: 'YOUTUBE',
    creatorCategories: ['Software', 'Education', 'Technology'],
    requiredSkills: ['Tutorials', 'Code Walkthrough'],
    hashtags: ['#DevTools', '#Coding'],
    createdAt: new Date().toISOString(),
    brand: {
      companyName: 'CloudStack IO',
      industry: 'Developer Tools & SaaS',
    },
    product: {
      id: 'p3',
      name: 'CloudStack VS Code Plugin',
      category: 'SaaS',
    },
    _count: { applications: 3, creators: 1 },
  },
];

export const CampaignDiscovery: React.FC = () => {
  const [campaigns] = useState<Campaign[]>(MARKETPLACE_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [pitch, setPitch] = useState('');
  const [proposedRate, setProposedRate] = useState<number>(55);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const categories = ['All', 'Technology', 'Hardware', 'Software', 'Productivity', 'Lifestyle'];

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesCategory =
      selectedCategory === 'All' || c.creatorCategories.includes(selectedCategory);
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.brand?.companyName && c.brand.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleApply = (camp: Campaign) => {
    setSelectedCampaign(camp);
    setProposedRate(camp.cpmRate);
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setSelectedCampaign(null);
      setPitch('');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3>Discover Brand Campaigns</h3>
        <p style={{ fontSize: '0.875rem' }}>
          Browse open campaigns from verified brands and earn performance credits per 1,000 verified YouTube views.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search campaigns by keyword, brand..."
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
          {categories.map((cat) => (
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

      {/* Campaigns Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredCampaigns.map((camp) => (
          <div key={camp.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <div className="flex items-center gap-2">
                  <Briefcase size={14} color="var(--color-brand)" />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{camp.brand?.companyName}</span>
                </div>
                <span className="badge badge-verified">
                  CPM ₹{camp.cpmRate} / 1k Views
                </span>
              </div>

              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{camp.title}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                {camp.description}
              </p>

              {camp.contentRequirements && (
                <div style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}>
                  <strong>Requirements:</strong> {camp.contentRequirements}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                {camp.creatorCategories.map((cat) => (
                  <span key={cat} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    <Tag size={10} /> {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Budget: <strong>{camp.budgetCredits.toLocaleString()} Credits</strong>
              </div>
              <button
                onClick={() => handleApply(camp)}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                <Send size={14} /> Apply to Campaign
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {selectedCampaign && (
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
            maxWidth: '540px',
            padding: '2rem',
            position: 'relative',
          }}>
            <button
              onClick={() => setSelectedCampaign(null)}
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
                <Sparkles size={12} /> Creator Application
              </div>
              <h3>Apply for {selectedCampaign.title}</h3>
              <p style={{ fontSize: '0.875rem' }}>
                Brand: <strong>{selectedCampaign.brand?.companyName}</strong> • Base CPM: <strong>₹{selectedCampaign.cpmRate} / 1k views</strong>
              </p>
            </div>

            {appliedSuccess ? (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-success-light)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-success)',
                fontWeight: 600,
              }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                Application submitted successfully! The brand will review your proposal.
              </div>
            ) : (
              <form onSubmit={submitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Proposed CPM Rate (Credits / 1,000 Verified Views)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={proposedRate}
                    onChange={(e) => setProposedRate(Number(e.target.value))}
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
                    Pitch & Creative Angle
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell the brand how you plan to feature their product, expected video format, and past video performance..."
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
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
                    onClick={() => setSelectedCampaign(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Application
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
