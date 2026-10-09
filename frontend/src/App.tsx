import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { BrandDashboard } from './components/BrandDashboard';
import { CreatorDashboard } from './components/CreatorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RoleType } from './types/auth';
import { 
  CheckCircle2, 
  Layers, 
  Bot, 
  Youtube, 
  ShieldCheck, 
  ArrowRight,
  Briefcase,
  Video,
  FileText,
  Sparkles,
  Coins
} from 'lucide-react';

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
          <div>
            {/* Hero Section */}
            <div style={{ maxWidth: '840px', margin: '1rem 0 3rem' }}>
              <div className="badge badge-verified" style={{ marginBottom: '1.25rem' }}>
                <Sparkles size={12} /> Phase 1 Live: Multi-Role Authentication & Workspace Ready
              </div>
              <h1 style={{ fontSize: '2.5rem', lineHeight: '1.15', marginBottom: '1rem' }}>
                Connect brands and creators through <span style={{ color: 'var(--color-brand)' }}>measurable performance</span>.
              </h1>
              <p style={{ fontSize: '1.15rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                The AI-assisted marketplace where brands deploy verified CPM campaigns and creators earn based on deterministic, 
                audited view growth. Powered by OpenRouter AI and YouTube Analytics.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handleOpenAuth('register', 'BRAND')}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                  id="hero-brand-signup-btn"
                >
                  <Briefcase size={16} /> I'm a Brand — Launch Campaign <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => handleOpenAuth('register', 'CREATOR')}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                  id="hero-creator-signup-btn"
                >
                  <Video size={16} color="var(--color-brand)" /> I'm a Creator — Join & Earn
                </button>
              </div>
            </div>

            {/* Core Value Pillars */}
            <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '3.5rem' }}>
              <div className="card">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-brand-light)',
                  color: 'var(--color-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <Bot size={22} />
                </div>
                <h3>AI Semantic Intelligence</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  OpenRouter free model router parses product briefs and evaluates creator audience fit. Deterministic math calculates scores.
                </p>
              </div>

              <div className="card">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-success-light)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <Youtube size={22} />
                </div>
                <h3>Verified YouTube Analytics</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  Direct Google OAuth 2.0 integration. Periodic time-series snapshots verify genuine view velocity and audience retention.
                </p>
              </div>

              <div className="card">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#fffbeb',
                  color: 'var(--color-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <Coins size={22} />
                </div>
                <h3>Performance Reward Ledger</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  Immutable internal credit accounting. Payouts calculated deterministically per 1,000 verified incremental views (CPM).
                </p>
              </div>
            </div>

            {/* Verification Tiers Design Demonstration */}
            <div className="card" style={{ marginBottom: '3rem' }}>
              <div className="card-header flex items-center justify-between">
                <div>
                  <h3>Data Integrity & Source Verification Standard</h3>
                  <p style={{ fontSize: '0.85rem' }}>Every metric on CreatorOS is strictly segregated by source type.</p>
                </div>
                <ShieldCheck size={20} color="var(--color-brand)" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="badge badge-verified">
                      <CheckCircle2 size={12} /> Platform Verified
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>142,800</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Direct Google OAuth / YouTube API snapshot
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="badge badge-uploaded">
                      <FileText size={12} /> Uploaded Document
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>85,200</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Uploaded CSV / PDF report export (Unverified)
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="badge badge-selfreported">
                      ⚠ Self Reported
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>50,000</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Manually entered by creator on profile
                  </div>
                </div>
              </div>
            </div>

            {/* Roadmap */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <div>
                  <h3>Phase Execution Roadmap</h3>
                  <p style={{ fontSize: '0.85rem' }}>Current progress across the 8 SaaS lifecycle phases.</p>
                </div>
                <Layers size={20} color="var(--color-brand)" />
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Phase</th>
                      <th>Module</th>
                      <th>Key Deliverables</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Phase 0</strong></td>
                      <td>Foundation & Scaffold</td>
                      <td>Monorepo, TS backend, React frontend, Prisma schema, /docs</td>
                      <td><span className="badge badge-verified">Completed</span></td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--color-brand-light)' }}>
                      <td><strong>Phase 1</strong></td>
                      <td><strong>Auth & Multi-Role Identity</strong></td>
                      <td><strong>JWT auth, bcrypt, Brand & Creator RBAC, Onboarding, Role Switcher</strong></td>
                      <td><span className="badge badge-verified">Completed</span></td>
                    </tr>
                    <tr>
                      <td><strong>Phase 2</strong></td>
                      <td>Core Marketplace</td>
                      <td>Products, Campaigns, Applications, In-app Messaging</td>
                      <td><span className="badge badge-neutral">Next</span></td>
                    </tr>
                    <tr>
                      <td><strong>Phase 3</strong></td>
                      <td>Credit Ledger & Audit</td>
                      <td>Immutable double-entry wallet, AI token deductions, System Audit</td>
                      <td><span className="badge badge-neutral">Pending</span></td>
                    </tr>
                    <tr>
                      <td><strong>Phase 4</strong></td>
                      <td>AI Foundation</td>
                      <td>OpenRouter free router abstraction, Product brief extraction, Semantic match</td>
                      <td><span className="badge badge-neutral">Pending</span></td>
                    </tr>
                    <tr>
                      <td><strong>Phase 5</strong></td>
                      <td>YouTube Integration</td>
                      <td>Google OAuth, Channel & Video metadata, Periodic snapshot worker</td>
                      <td><span className="badge badge-neutral">Pending</span></td>
                    </tr>
                    <tr>
                      <td><strong>Phase 6</strong></td>
                      <td>Performance Engine</td>
                      <td>Incremental views calculation, CPM reward distributions, Leaderboard</td>
                      <td><span className="badge badge-neutral">Pending</span></td>
                    </tr>
                    <tr>
                      <td><strong>Phase 7</strong></td>
                      <td>Professional UI Showcase</td>
                      <td>Marketing landing page, interactive demo seed data, responsive dashboards</td>
                      <td><span className="badge badge-neutral">Pending</span></td>
                    </tr>
                    <tr>
                      <td><strong>Phase 8</strong></td>
                      <td>Testing & Production Hardening</td>
                      <td>Unit/integration test suite, Docker builds, deployment validation</td>
                      <td><span className="badge badge-neutral">Pending</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
          <div>CreatorOS Platform — Phase 1 Multi-Role Authentication</div>
          <div className="flex items-center gap-4">
            <span>Light Mode B2B Enterprise Architecture</span>
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
