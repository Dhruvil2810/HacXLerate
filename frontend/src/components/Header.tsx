import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleType } from '../types/auth';
import { 
  Coins, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Briefcase, 
  Video, 
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'register', role?: RoleType) => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, onOpenOnboarding }) => {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleRoleSelect = async (role: RoleType) => {
    setRoleDropdownOpen(false);
    await switchRole(role);
  };

  const getRoleIcon = (role: RoleType) => {
    switch (role) {
      case 'BRAND':
        return <Briefcase size={14} color="var(--color-brand)" />;
      case 'CREATOR':
        return <Video size={14} color="var(--color-success)" />;
      case 'ADMIN':
        return <ShieldCheck size={14} color="var(--color-danger)" />;
    }
  };

  return (
    <header style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div className="container flex items-center justify-between" style={{ height: '64px' }}>
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.2rem',
          }}>
            C
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Creator<span style={{ color: 'var(--color-brand)' }}>OS</span>
            </span>
            <span className="badge badge-neutral" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
              SAAS PLATFORM
            </span>
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              {/* Credit Balance Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.35rem 0.75rem',
                backgroundColor: 'var(--color-brand-light)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: 'var(--color-brand)',
                border: '1px solid var(--color-info-border)',
              }}>
                <Coins size={14} />
                <span>{user.creditWallet?.balance.toLocaleString() || '0'} Credits</span>
              </div>

              {/* Multi-Role Switcher Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.825rem',
                    padding: '0.4rem 0.8rem',
                  }}
                  id="role-switcher-btn"
                >
                  {getRoleIcon(user.activeRole)}
                  <span style={{ fontWeight: 600 }}>{user.activeRole}</span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {roleDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '210px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '6px',
                    zIndex: 50,
                  }}>
                    <div style={{ padding: '6px 8px', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Switch Workspace
                    </div>
                    <button
                      onClick={() => handleRoleSelect('BRAND')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: user.activeRole === 'BRAND' ? 'var(--bg-subtle)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: user.activeRole === 'BRAND' ? 700 : 500,
                      }}
                    >
                      <Briefcase size={14} color="var(--color-brand)" /> Brand Workspace
                    </button>
                    <button
                      onClick={() => handleRoleSelect('CREATOR')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: user.activeRole === 'CREATOR' ? 'var(--bg-subtle)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: user.activeRole === 'CREATOR' ? 700 : 500,
                      }}
                    >
                      <Video size={14} color="var(--color-success)" /> Creator Workspace
                    </button>
                    <button
                      onClick={() => handleRoleSelect('ADMIN')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: user.activeRole === 'ADMIN' ? 'var(--bg-subtle)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: user.activeRole === 'ADMIN' ? 700 : 500,
                      }}
                    >
                      <ShieldCheck size={14} color="var(--color-danger)" /> Admin Control
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar / Profile */}
              <div 
                onClick={onOpenOnboarding}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-md)',
                }}
                title="Click to edit profile"
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}>
                  <UserIcon size={16} />
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                title="Sign Out"
                id="logout-btn"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
                id="header-signin-btn"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
                id="header-register-btn"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
