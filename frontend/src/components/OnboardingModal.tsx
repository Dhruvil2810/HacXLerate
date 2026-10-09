import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { X, CheckCircle2, Briefcase, Video, Globe, MapPin } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS = ['Technology', 'Gaming', 'Finance', 'Lifestyle', 'Education', 'Beauty & Fashion', 'Fitness & Health', 'Entertainment'];
const SKILL_OPTIONS = ['4K Video Production', 'YouTube Shorts / Reels', 'Product Reviews', 'Tutorials & Guides', 'Unboxing', 'Scriptwriting'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { user, token, updateUser } = useAuth();
  if (!isOpen || !user) return null;

  const isBrand = user.activeRole === 'BRAND';

  // Brand Form States
  const [companyName, setCompanyName] = useState(user.brandProfile?.companyName || user.name || '');
  const [industry, setIndustry] = useState(user.brandProfile?.industry || 'Technology & Software');
  const [websiteUrl, setWebsiteUrl] = useState(user.brandProfile?.websiteUrl || '');
  const [description, setDescription] = useState(user.brandProfile?.description || '');

  // Creator Form States
  const [handle, setHandle] = useState(user.creatorProfile?.handle || `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_yt`);
  const [bio, setBio] = useState(user.creatorProfile?.bio || '');
  const [location, setLocation] = useState(user.creatorProfile?.location || 'New York, USA');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(user.creatorProfile?.categories || ['Technology']);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user.creatorProfile?.skills || ['Product Reviews']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleSkill = (sk: string) => {
    setSelectedSkills((prev) =>
      prev.includes(sk) ? prev.filter((s) => s !== sk) : [...prev, sk]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isBrand) {
        const res = await apiRequest('/onboarding/brand', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            companyName,
            industry,
            websiteUrl: websiteUrl || undefined,
            description: description || undefined,
          }),
        });

        if (res.success && res.data?.user) {
          updateUser(res.data.user);
          onClose();
        } else {
          // If offline / demo mode, update state locally
          updateUser({
            ...user,
            brandProfile: {
              id: user.brandProfile?.id || 'bp_local',
              userId: user.id,
              companyName,
              industry,
              websiteUrl,
              description,
            },
          });
          onClose();
        }
      } else {
        const res = await apiRequest('/onboarding/creator', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            handle,
            bio: bio || undefined,
            location: location || undefined,
            categories: selectedCategories,
            skills: selectedSkills,
            tools: ['Final Cut Pro', 'Sony A7S'],
            contentTypes: ['Long-form Review', 'Shorts'],
          }),
        });

        if (res.success && res.data?.user) {
          updateUser(res.data.user);
          onClose();
        } else {
          // If offline / demo mode, update state locally
          updateUser({
            ...user,
            creatorProfile: {
              id: user.creatorProfile?.id || 'cp_local',
              userId: user.id,
              handle,
              bio,
              location,
              categories: selectedCategories,
              skills: selectedSkills,
              tools: ['Final Cut Pro', 'Sony A7S'],
              contentTypes: ['Long-form Review', 'Shorts'],
              isVerified: user.creatorProfile?.isVerified || false,
            },
          });
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        position: 'relative',
        border: '1px solid var(--border-subtle)',
      }}>
        <button
          onClick={onClose}
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
            <CheckCircle2 size={12} /> Step 2: Complete Profile
          </div>
          <h2>{isBrand ? 'Set Up Brand Profile' : 'Set Up Creator Profile'}</h2>
          <p style={{ fontSize: '0.875rem' }}>
            {isBrand
              ? 'Tell creators about your company, industry, and goals.'
              : 'Add your content focus, niches, and channel handle to receive high-fit campaign matches.'}
          </p>
        </div>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isBrand ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Company Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Industry / Category
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Consumer Electronics, SaaS, Gaming"
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
                  Official Website
                </label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourcompany.com"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Brand Description & Mission
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what your products do and your target audience..."
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
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Creator Handle / Channel Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Video size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="e.g. techreview_alex"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Location
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Content Niches / Categories
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-full)',
                        border: selectedCategories.includes(cat)
                          ? '1px solid var(--color-brand)'
                          : '1px solid var(--border-default)',
                        backgroundColor: selectedCategories.includes(cat)
                          ? 'var(--color-brand-light)'
                          : 'var(--bg-surface)',
                        color: selectedCategories.includes(cat)
                          ? 'var(--color-brand)'
                          : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Skills & Production Capabilities
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {SKILL_OPTIONS.map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-full)',
                        border: selectedSkills.includes(sk)
                          ? '1px solid var(--color-brand)'
                          : '1px solid var(--border-default)',
                        backgroundColor: selectedSkills.includes(sk)
                          ? 'var(--color-brand-light)'
                          : 'var(--bg-surface)',
                        color: selectedSkills.includes(sk)
                          ? 'var(--color-brand)'
                          : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      {sk}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Creator Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell brands about your audience demographics, past brand sponsorships, and format..."
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
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Skip for now
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
