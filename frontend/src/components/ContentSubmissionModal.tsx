import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Youtube, X, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';

interface ContentSubmissionModalProps {
  isOpen: boolean;
  campaignId?: string;
  campaignTitle?: string;
  cpmRate?: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface CampaignOption {
  id: string;
  title: string;
  cpmRate: number;
}

export const ContentSubmissionModal: React.FC<ContentSubmissionModalProps> = ({
  isOpen,
  campaignId: initialCampaignId = '',
  campaignTitle: initialCampaignTitle = '',
  cpmRate: initialCpmRate = 50,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId);
  const [campaignOptions, setCampaignOptions] = useState<CampaignOption[]>([]);
  const [url, setUrl] = useState('');
  const [initialViews, setInitialViews] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active campaigns for selection if not pre-provided
  useEffect(() => {
    if (!isOpen || !token) return;

    async function loadCampaigns() {
      try {
        const res = await apiRequest<{ campaigns: any[] }>('/campaigns/marketplace', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.success && res.data?.campaigns && res.data.campaigns.length > 0) {
          const opts: CampaignOption[] = res.data.campaigns.map((c: any) => ({
            id: c.id,
            title: c.title,
            cpmRate: c.cpmRate || 50,
          }));
          setCampaignOptions(opts);

          if (!selectedCampaignId || selectedCampaignId === '') {
            setSelectedCampaignId(opts[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load campaigns for submission modal', err);
      }
    }

    if (!initialCampaignId) {
      loadCampaigns();
    } else {
      setSelectedCampaignId(initialCampaignId);
    }
  }, [isOpen, token, initialCampaignId]);

  if (!isOpen) return null;

  // Extract YouTube Video ID
  const extractVideoId = (inputUrl: string): string | null => {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = inputUrl.match(regExp);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(url);

  const currentCampaign = campaignOptions.find((c) => c.id === selectedCampaignId) || {
    id: selectedCampaignId,
    title: initialCampaignTitle || 'Active Performance Campaign',
    cpmRate: initialCpmRate,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const activeId = selectedCampaignId || initialCampaignId;
    if (!activeId) {
      setError('Please select a campaign for this submission.');
      return;
    }

    if (!videoId) {
      setError('Please provide a valid YouTube video or Short URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/performance/content/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          campaignId: activeId,
          publishedUrl: url.trim(),
          platform: 'YOUTUBE',
          initialViews: Number(initialViews),
        }),
      });

      onSuccess();
      onClose();
      setUrl('');
      setInitialViews(0);
    } catch (err: any) {
      setError(err.message || 'Failed to register published content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div className="flex items-center gap-2">
            <div style={{
              padding: '0.4rem',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
            }}>
              <Youtube size={18} />
            </div>
            <div>
              <h3>Submit Published Content Link</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target Campaign: <strong>{currentCampaign.title}</strong> • CPM: <strong>₹{currentCampaign.cpmRate}/1k views</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.3rem' }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Campaign Selector if multiple available */}
          {campaignOptions.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Select Active Campaign <span style={{ color: 'var(--color-brand)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  {campaignOptions.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.title} — CPM ₹{camp.cpmRate} / 1k views
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              YouTube Video or Short URL <span style={{ color: 'var(--color-brand)' }}>*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Live Video Preview Box */}
          {videoId ? (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
            }}>
              <div style={{ position: 'relative', width: '120px', height: '68px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt="Video thumbnail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  color: '#ffffff',
                }}>
                  <PlayCircle size={24} />
                </div>
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                <div className="badge badge-verified" style={{ marginBottom: '0.25rem' }}>
                  <CheckCircle2 size={11} /> Video ID: {videoId}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Platform will record baseline views immediately upon submission.
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '0.75rem',
              border: '1px dashed var(--border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}>
              Enter a valid YouTube URL to preview video details and verify tracking eligibility.
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Baseline View Count at Submission (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={initialViews}
              onChange={(e) => setInitialViews(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="0"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Incremental performance rewards are calculated strictly on views gained after baseline ($V_0$).
            </p>
          </div>

          <div className="flex items-center justify-end gap-2" style={{ marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !videoId}
              className="btn btn-primary"
              id="btn-submit-content-link"
            >
              {loading ? 'Registering...' : 'Start Live Performance Tracking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
