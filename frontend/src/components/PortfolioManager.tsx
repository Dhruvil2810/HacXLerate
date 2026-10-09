import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Wrench, 
  Film, 
  CheckCircle2, 
  AlertCircle,
  X,
  FileCheck
} from 'lucide-react';

interface PortfolioItem {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  category?: string;
  toolsUsed: string[];
  metricsSummary?: Record<string, any>;
  createdAt?: string;
}

const COMMON_AI_TOOLS = [
  'Midjourney v6',
  'Runway Gen-3 Alpha',
  'Sora',
  'Kling AI',
  'Stable Diffusion XL',
  'ComfyUI',
  'Flux.1',
  'ElevenLabs',
  'Pika 1.5',
  'Luma Dream Machine',
  'Topaz Video AI',
  'Magnific AI'
];

const CATEGORIES = [
  'AI Advertisements',
  'AI Short Films',
  'AI Animations',
  'Product Visualizations',
  'Concept Art & Keyframes',
  'Motion Graphics',
  'AI Fashion & Editorial',
  'Storyboards & Animatics',
];

export const PortfolioManager: React.FC = () => {
  const { user, token } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [workflowNotes, setWorkflowNotes] = useState('');
  const [licensingType, setLicensingType] = useState('Full Commercial Rights Available');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const fetchPortfolio = async () => {
    if (!user?.creatorProfile?.id) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest<{ creator: { portfolioItems: PortfolioItem[] } }>(
        `/creators/${user.creatorProfile.id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data?.creator?.portfolioItems) {
        setItems(res.data.creator.portfolioItems);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user?.creatorProfile?.id, token]);

  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter((t) => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest<{ item: PortfolioItem }>('/creators/portfolio', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          description: workflowNotes ? `${description}\n\nWorkflow: ${workflowNotes}` : description,
          mediaUrl,
          thumbnailUrl: thumbnailUrl || mediaUrl,
          category,
          toolsUsed: selectedTools,
          metricsSummary: {
            licensingType,
            evidenceUrl: evidenceUrl || null,
            workflow: workflowNotes || null,
            verifiedAt: new Date().toISOString(),
          },
        }),
      });

      if (res.data?.item) {
        setItems([res.data.item, ...items]);
      } else {
        fetchPortfolio();
      }

      setSuccessMessage('✓ AI Portfolio project added successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Reset form
      setTitle('');
      setDescription('');
      setMediaUrl('');
      setThumbnailUrl('');
      setSelectedTools([]);
      setWorkflowNotes('');
      setEvidenceUrl('');
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add portfolio item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this portfolio project?')) return;

    try {
      await apiRequest(`/creators/portfolio/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(items.filter((i) => i.id !== itemId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete portfolio item');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderLeft: '4px solid var(--color-brand)'
      }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
              <span className="badge badge-verified">
                <Sparkles size={12} /> AI Generative Media Portfolio
              </span>
              <span className="badge badge-neutral">
                <FileCheck size={12} /> Commercial Rights Declaration
              </span>
            </div>
            <h2>AI Portfolio & Generative Workflows</h2>
            <p style={{ marginTop: '0.25rem' }}>
              Showcase your AI-generated films, animations, product visualizations, and the specific tools/models used.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
            id="btn-add-portfolio-item"
          >
            <Plus size={14} /> Add Portfolio Project
          </button>
        </div>
      </div>

      {successMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-success-light)',
          color: 'var(--color-success)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          border: '1px solid var(--color-success-border)',
        }}>
          {successMessage}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-lg)' }}></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="card" style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          border: '2px dashed var(--border-default)',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <Film size={40} color="var(--color-brand)" style={{ margin: '0 auto 12px' }} />
          <h3>No AI Portfolio Projects Added Yet</h3>
          <p style={{ maxWidth: '480px', margin: '0.5rem auto 1.5rem', fontSize: '0.875rem' }}>
            Brands search creators based on specific AI tools (e.g. Runway Gen-3, Midjourney, Kling, ComfyUI) and creative specializations. Add your first project to get discovered.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ margin: '0 auto' }}
          >
            <Plus size={14} /> Add Your First AI Project
          </button>
        </div>
      )}

      {/* Portfolio Grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
              {/* Media Thumbnail / Embed */}
              <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#0f172a' }}>
                {item.thumbnailUrl || item.mediaUrl ? (
                  <img
                    src={item.thumbnailUrl || item.mediaUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8'
                  }}>
                    <Film size={32} />
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  {item.category || 'AI Creative'}
                </div>
              </div>

              {/* Content Body */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                <div className="flex items-center justify-between">
                  <h4 style={{ fontSize: '1.05rem' }}>{item.title}</h4>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.5rem', color: 'var(--color-danger)' }}
                    title="Delete portfolio project"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {item.description && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                )}

                {/* AI Tools Badges */}
                {item.toolsUsed && item.toolsUsed.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {item.toolsUsed.map((tool) => (
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
                  </div>
                )}

                {/* Actions & Links */}
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }} className="flex items-center justify-between">
                  <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
                    <CheckCircle2 size={11} /> Commercial Rights Ready
                  </span>
                  {item.mediaUrl && (
                    <a
                      href={item.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      <ExternalLink size={12} /> View Project
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Portfolio Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <div style={{
                  padding: '0.4rem',
                  backgroundColor: 'var(--color-brand-light)',
                  color: 'var(--color-brand)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <Sparkles size={18} />
                </div>
                <h3>Add AI Portfolio Project</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ padding: '0.3rem' }}>
                <X size={16} />
              </button>
            </div>

            {error && (
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
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Project Title <span style={{ color: 'var(--color-brand)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Cinematic Short Film or Luxury Watch 3D Commercial"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Media URL (Video, Image, or Showcase Link) <span style={{ color: 'var(--color-brand)' }}>*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://youtube.com/watch?v=... or image link"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              {/* AI Tools Multi-Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  AI Tools & Models Used (Select all that apply)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {COMMON_AI_TOOLS.map((tool) => {
                    const isSelected = selectedTools.includes(tool);
                    return (
                      <button
                        type="button"
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                      >
                        {tool} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Creative Process & Workflow Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain your generation workflow (e.g. base keyframes created in Midjourney v6 -> animated with Runway Gen-3 camera control -> lip-sync in ElevenLabs -> post-color in DaVinci)..."
                  value={workflowNotes}
                  onChange={(e) => setWorkflowNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Commercial-Use Rights
                  </label>
                  <select
                    value={licensingType}
                    onChange={(e) => setLicensingType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                  >
                    <option value="Full Commercial Rights Available">Full Commercial Rights Available</option>
                    <option value="Non-Exclusive Commercial License">Non-Exclusive Commercial License</option>
                    <option value="Custom Licensing upon Request">Custom Licensing upon Request</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Workflow / Prompt Evidence URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/... or Google Drive proof"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title || !mediaUrl}
                  className="btn btn-primary"
                  id="btn-submit-portfolio-form"
                >
                  {submitting ? 'Saving Project...' : 'Publish to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
