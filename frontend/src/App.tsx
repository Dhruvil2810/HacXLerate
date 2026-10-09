import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { BrandDashboard } from './components/BrandDashboard';
import { CreatorDashboard } from './components/CreatorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicShowcase } from './components/PublicShowcase';
import { RoleType } from './types/auth';

function MarketplaceApp() {
  const { user, isAuthenticated } = useAuth();
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<RoleType>('BRAND');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register', role: RoleType = 'BRAND') => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header with Role Switcher & Auth Actions */}
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1, padding: '2.5rem 1.5rem' }}>
        {isAuthenticated && user ? (
          /* Role-Aware Authenticated Workspace */
          <div>
            {user.activeRole === 'BRAND' && (
              <BrandDashboard onOpenOnboarding={() => setOnboardingOpen(true)} />
            )}
            {user.activeRole === 'CREATOR' && (
              <CreatorDashboard onOpenOnboarding={() => setOnboardingOpen(true)} />
            )}
            {user.activeRole === 'ADMIN' && (
              <AdminDashboard />
            )}
          </div>
        ) : (
          /* Public Showcase & Marketing Landing Experience */
          <PublicShowcase onOpenAuth={handleOpenAuth} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'var(--bg-surface)', 
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.5rem 0',
        marginTop: 'auto'
      }}>
        <div className="container flex items-center justify-between" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div>CreatorOS — AI-Native Creative & Performance Marketplace</div>
          <div className="flex items-center gap-4">
            <span>Verified AI Workflows • YouTube CPM • Immutable Ledger</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
        defaultRole={authRole}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceApp />
    </AuthProvider>
  );
}
