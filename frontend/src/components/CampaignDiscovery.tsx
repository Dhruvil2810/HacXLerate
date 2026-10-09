import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { 
  Search, 
  Briefcase, 
  Send, 
  X, 
  CheckCircle2, 
  Tag, 
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react';

interface CampaignItem {
  id: string;
  brandId: string;
  title: string;
  objective: string;
  description: string;
  budgetCredits: number;
  allocatedCredits: number;
  spentCredits: number;
  rewardModel: string;
  cpmRate: number;
  status: string;
  contentPlatform: string;
  contentType?: string;
  creatorCategories: string[];
  requiredSkills: string[];
  contentRequirements?: string;
  hashtags: string[];
  createdAt: string;
  brand?: {
    companyName: string;
    industry?: string;
  };
  product?: {
    id: string;
    name: string;
    category: string;
  };
  _count?: {
    applications: number;
    creators: number;
  };
}

const CATEGORIES = ['All', 'Technology', 'AI Film & Animation', 'Product Design', 'Gaming', 'Productivity', 'Lifestyle'];

export const CampaignDiscovery: React.FC = () => {
  const { user, token } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Application Modal state
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
  const [pitch, setPitch] = useState('');
  const [proposedRate, setProposedRate] = useState<number>(50);
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [aiGeneratingPitch, setAiGeneratingPitch] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.set('category', selectedCategory);

      const url = `/campaigns/marketplace${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await apiRequest<any>(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const list = res.data?.campaigns || (Array.isArray(res.data) ? res.data : []);
      setCampaigns(list);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiPitch = async () => {
    if (!selectedCampaign || !token) return;
    setAiGeneratingPitch(true);
    try {
      const res = await apiRequest<any>('/ai/pitch-assist', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          campaign: {
            title: selectedCampaign.title,
            objective: selectedCampaign.objective,
            categories: selectedCampaign.creatorCategories,
            description: selectedCampaign.description,
            cpmRate: selectedCampaign.cpmRate,
          },
          creator: {
            handle: user?.creatorProfile?.handle || user?.name || 'Creator',
            categories: user?.creatorProfile?.categories || [],
            bio: user?.creatorProfile?.bio || '',
          },
        }),
      });
      if (res.success && res.data?.pitch) {
        setPitch(res.data.pitch);
        if (res.data.suggestedRate) {
          setProposedRate(res.data.suggestedRate);
        }
      }
    } catch (err: any) {
      console.error('Failed to generate pitch with AI', err);
    } finally {
      setAiGeneratingPitch(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory, token]);

  const filteredCampaigns = campaigns.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.brand?.companyName.toLowerCase().includes(q) ||
      c.creatorCategories.some((cat) => cat.toLowerCase().includes(q))
    );
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !token) return;

    setSubmitting(true);
    setApplyError(null);

    try {
      await apiRequest(`/campaigns/${selectedCampaign.id}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          pitch,
          proposedRate: Number(proposedRate),
        }),
      });

      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setSelectedCampaign(null);
        setPitch('');
      }, 2000);
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h3>Creative Briefs & Performance Opportunities</h3>
        <p style={{ fontSize: '0.875rem' }}>
          Discover creative commissions, AI advertisements, and performance campaigns with verified escrow pools.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search briefs by title, brand, or requirements..."
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

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="skeleton" style={{ height: '220px', borderRadius: 'var(--radius-lg)' }}></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCampaigns.length === 0 && (
        <div className="card" style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          border: '2px dashed var(--border-default)',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <FileText size={40} color="var(--color-brand)" style={{ margin: '0 auto 12px' }} />
          <h3>No Creative Briefs Found</h3>
          <p style={{ maxWidth: '450px', margin: '0.5rem auto 1.5rem', fontSize: '0.875rem' }}>
            No open briefs match your search criteria. Brands regularly publish new AI creative briefs and CPM campaigns.
          </p>
        </div>
      )}

      {/* Campaign Cards Grid */}
      {!loading && filteredCampaigns.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {filteredCampaigns.map((camp) => (
            <div key={camp.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                    <span className="badge badge-verified">
                      <Briefcase size={11} /> {camp.brand?.companyName || 'Brand Sponsor'}
                    </span>
                    <span className="badge badge-neutral">
                      {camp.rewardModel}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem' }}>{camp.title}</h4>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--color-brand)', fontSize: '1.1rem' }}>
                    {camp.rewardModel === 'CPM' ? `₹${camp.cpmRate} CPM` : `${camp.budgetCredits} Credits`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Escrow: {camp.budgetCredits.toLocaleString()} Credits
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {camp.description}
              </p>

              {/* Requirements & Categories */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {camp.creatorCategories.map((cat) => (
                  <span key={cat} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    <Tag size={10} /> {cat}
                  </span>
                ))}
              </div>

              {camp.contentRequirements && (
                <div style={{
                  padding: '0.6rem 0.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}>
                  <strong>Key Requirements:</strong> {camp.contentRequirements}
                </div>
              )}

              {/* Action Footer */}
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }} className="flex items-center justify-between">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {camp._count?.applications || 0} creators applied
                </div>

                <button
                  onClick={() => {
                    setSelectedCampaign(camp);
                    setProposedRate(camp.cpmRate || 50);
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                  id={`btn-apply-${camp.id}`}
                >
                  <Send size={12} /> Apply to Brief
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Modal */}
      {selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3>Apply to Brief</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedCampaign.title} • {selectedCampaign.brand?.companyName}
                </p>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="btn btn-secondary" style={{ padding: '0.3rem' }}>
                <X size={16} />
              </button>
            </div>

            {applySuccess && (
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
                Application submitted successfully! The brand will review your profile.
              </div>
            )}

            {applyError && (
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
                {applyError}
              </div>
            )}

            <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                    Your Creative Pitch & Approach <span style={{ color: 'var(--color-brand)' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAiPitch}
                    disabled={aiGeneratingPitch}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    id="btn-ai-generate-pitch"
                  >
                    <Sparkles size={12} color="var(--color-brand)" />
                    {aiGeneratingPitch ? 'Generating...' : '✨ AI Generate Pitch'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain your visual direction, AI tools you plan to use, and why you are the best fit for this brief..."
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
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
                  Proposed CPM Rate (₹ / 1,000 Verified Views)
                </label>
                <input
                  type="number"
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

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setSelectedCampaign(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !pitch}
                  className="btn btn-primary"
                  id="btn-confirm-apply"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
