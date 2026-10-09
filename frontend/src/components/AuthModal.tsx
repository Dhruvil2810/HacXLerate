import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleType } from '../types/auth';
import { X, Briefcase, Video, ShieldCheck, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  defaultRole?: RoleType;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  defaultRole = 'BRAND',
}) => {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [role, setRole] = useState<RoleType>(defaultRole);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || 'Login failed');
        } else {
          onClose();
        }
      } else {
        const result = await register(email, password, name, role);
        if (!result.success) {
          setError(result.error || 'Registration failed');
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demoRole: RoleType) => {
    demoLogin(demoRole);
    onClose();
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
        maxWidth: '480px',
        padding: '2rem',
        position: 'relative',
        border: '1px solid var(--border-subtle)',
      }}>
        {/* Close Button */}
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
            padding: '4px',
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-brand-light)',
            color: 'var(--color-brand)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
          }}>
            <Lock size={22} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
            {mode === 'login' ? 'Sign in to CreatorOS' : 'Create your account'}
          </h2>
          <p style={{ fontSize: '0.875rem' }}>
            {mode === 'login'
              ? 'Enter your credentials or select a quick demo profile'
              : 'Join the data-driven performance marketplace'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-danger-light)',
            border: '1px solid var(--color-danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
          }}>
            {error}
          </div>
        )}

        {/* Mode Selector Tab */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          marginBottom: '1.5rem',
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: mode === 'login' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: mode === 'register' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Register
          </button>
        </div>

        {/* Register Role Selector */}
        {mode === 'register' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Select Primary Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div
                onClick={() => setRole('BRAND')}
                style={{
                  border: `2px solid ${role === 'BRAND' ? 'var(--color-brand)' : 'var(--border-subtle)'}`,
                  backgroundColor: role === 'BRAND' ? 'var(--color-brand-light)' : 'var(--bg-surface)',
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <Briefcase size={20} color={role === 'BRAND' ? 'var(--color-brand)' : 'var(--text-muted)'} style={{ margin: '0 auto 4px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: role === 'BRAND' ? 'var(--color-brand)' : 'var(--text-primary)' }}>
                  Brand / Sponsor
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Promote products & hire</div>
              </div>

              <div
                onClick={() => setRole('CREATOR')}
                style={{
                  border: `2px solid ${role === 'CREATOR' ? 'var(--color-brand)' : 'var(--border-subtle)'}`,
                  backgroundColor: role === 'CREATOR' ? 'var(--color-brand-light)' : 'var(--bg-surface)',
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <Video size={20} color={role === 'CREATOR' ? 'var(--color-brand)' : 'var(--text-muted)'} style={{ margin: '0 auto 4px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: role === 'CREATOR' ? 'var(--color-brand)' : 'var(--text-primary)' }}>
                  Content Creator
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Connect social & earn</div>
              </div>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Full Name / Brand Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  required
                  placeholder={role === 'BRAND' ? 'Acme Corp / John Doe' : 'Jane Doe'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.7rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0 1rem',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }}></div>
          <span style={{ padding: '0 0.75rem' }}>Instant Demo Access</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }}></div>
        </div>

        {/* Demo One-Click Access */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handleDemoClick('BRAND')}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.45rem' }}
          >
            <Briefcase size={12} color="var(--color-brand)" /> Brand
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick('CREATOR')}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.45rem' }}
          >
            <Video size={12} color="var(--color-brand)" /> Creator
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick('ADMIN')}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.45rem' }}
          >
            <ShieldCheck size={12} color="var(--color-brand)" /> Admin
          </button>
        </div>
      </div>
    </div>
  );
};
