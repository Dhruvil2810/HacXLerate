import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Coins, 
  Server, 
  Bot, 
  Activity, 
  X, 
  CheckCircle2, 
  UserCheck,
  UserX
} from 'lucide-react';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  creditBalance: number;
}

const DEMO_USERS: ManagedUser[] = [
  { id: 'usr_1', name: 'Nexus Tech Labs', email: 'brand@nexus.com', role: 'BRAND', status: 'ACTIVE', creditBalance: 12500 },
  { id: 'usr_2', name: 'Alex Rivera', email: 'alex@techreview.io', role: 'CREATOR', status: 'ACTIVE', creditBalance: 2850 },
  { id: 'usr_3', name: 'Sarah Chen', email: 'sarah@codes.io', role: 'CREATOR', status: 'ACTIVE', creditBalance: 1950 },
  { id: 'usr_4', name: 'Zenith Workspace', email: 'contact@zenith.com', role: 'BRAND', status: 'ACTIVE', creditBalance: 8200 },
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>(DEMO_USERS);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  // Adjustment modal states
  const [selectedUserId, setSelectedUserId] = useState(DEMO_USERS[0].id);
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustType, setAdjustType] = useState<'CREDIT_GRANT' | 'ADMIN_ADJUSTMENT' | 'REVERSAL'>('ADMIN_ADJUSTMENT');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  const handleStatusToggle = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === selectedUserId) {
          return { ...u, creditBalance: u.creditBalance + adjustAmount };
        }
        return u;
      })
    );
    setAdjustSuccess(true);
    setTimeout(() => {
      setAdjustSuccess(false);
      setIsAdjustModalOpen(false);
      setAdjustReason('');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Admin Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderLeft: '4px solid var(--color-danger)' 
      }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-neutral" style={{ marginBottom: '0.5rem' }}>
              <ShieldCheck size={12} color="var(--color-danger)" /> System Administration & Governance
            </div>
            <h2>Admin Control Center</h2>
            <p style={{ marginTop: '0.25rem' }}>
              Logged in as {user?.email}. Monitor system health, execute controlled credit adjustments, and audit platform security.
            </p>
          </div>

          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
            id="admin-adjust-credit-btn"
          >
            <Coins size={16} /> Adjust User Credits
          </button>
        </div>
      </div>

      {/* Admin High-Level Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Total Users</span>
            <Users size={16} color="var(--color-brand)" />
          </div>
          <div className="metric-value">
            1,420
          </div>
          <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
            890 Creators • 530 Brands
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Circulating Credits</span>
            <Coins size={16} color="var(--color-brand)" />
          </div>
          <div className="metric-value">
            2.4M
          </div>
          <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
            Immutable Ledger Balanced
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">AI Token Queries</span>
            <Bot size={16} color="var(--color-brand)" />
          </div>
          <div className="metric-value">
            18.5K
          </div>
          <div className="metric-delta" style={{ color: 'var(--color-info)' }}>
            openrouter/free tier
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">System Health</span>
            <Server size={16} color="var(--color-success)" />
          </div>
          <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot status-dot-active"></span>
            100%
          </div>
          <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
            All Services Operational
          </div>
        </div>
      </div>

      {/* User Management & Moderation Table */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h3>User Directory & Account Status</h3>
            <p style={{ fontSize: '0.85rem' }}>Inspect user balances, roles, and manage suspension states.</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User / Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Credit Balance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td><span className="badge badge-neutral">{u.role}</span></td>
                  <td>
                    <span className={`badge ${u.status === 'ACTIVE' ? 'badge-verified' : 'badge-selfreported'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <strong>{u.creditBalance.toLocaleString()} Credits</strong>
                  </td>
                  <td>
                    <button
                      onClick={() => handleStatusToggle(u.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      {u.status === 'ACTIVE' ? <><UserX size={12} /> Suspend</> : <><UserCheck size={12} /> Unsuspend</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Audit Log Trail */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h3>Append-Only Audit Trail (Recent Activity)</h3>
            <p style={{ fontSize: '0.85rem' }}>Every identity, credit, and administrative event is recorded immutably.</p>
          </div>
          <div className="badge badge-neutral">
            <Activity size={12} /> Live Stream
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Actor ID</th>
                <th>Entity</th>
                <th>Details / Metadata</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>Just now</code></td>
                <td><span className="badge badge-verified">LOGIN_SUCCESS</span></td>
                <td><code>{user?.id.slice(0, 8)}...</code></td>
                <td>User</td>
                <td>Role: {user?.activeRole} • IP: 127.0.0.1</td>
              </tr>
              <tr>
                <td><code>2 mins ago</code></td>
                <td><span className="badge badge-neutral">USER_REGISTERED</span></td>
                <td><code>usr_98a2f1</code></td>
                <td>User</td>
                <td>Primary Role: CREATOR • Bonus 500 Credits</td>
              </tr>
              <tr>
                <td><code>15 mins ago</code></td>
                <td><span className="badge badge-verified">CAMPAIGN_RESERVATION</span></td>
                <td><code>usr_48b1c0</code></td>
                <td>Campaign</td>
                <td>Campaign: Mechanical Keyboard Launch (4,000 Credits)</td>
              </tr>
              <tr>
                <td><code>1 hour ago</code></td>
                <td><span className="badge badge-uploaded">YOUTUBE_SYNC_COMPLETED</span></td>
                <td><code>usr_82d9a3</code></td>
                <td>YouTubeChannel</td>
                <td>Synced 42 videos • Delta views calculated (+14.2K)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Credit Modal */}
      {isAdjustModalOpen && (
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
            maxWidth: '520px',
            padding: '2rem',
            position: 'relative',
          }}>
            <button
              onClick={() => setIsAdjustModalOpen(false)}
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
              <div className="badge badge-selfreported" style={{ marginBottom: '0.5rem' }}>
                <Coins size={12} /> Controlled Adjustment
              </div>
              <h3>Adjust User Credit Balance</h3>
              <p style={{ fontSize: '0.875rem' }}>
                Every administrative adjustment is recorded in the immutable double-entry ledger and system audit trail.
              </p>
            </div>

            {adjustSuccess ? (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-success-light)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-success)',
                fontWeight: 600,
              }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                Credit adjustment executed and logged in ledger!
              </div>
            ) : (
              <form onSubmit={handleExecuteAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Select Target User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role}) — {u.creditBalance.toLocaleString()} Credits
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Amount (+ / - Credits)
                    </label>
                    <input
                      type="number"
                      required
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(Number(e.target.value))}
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
                      Transaction Type
                    </label>
                    <select
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                      }}
                    >
                      <option value="ADMIN_ADJUSTMENT">ADMIN_ADJUSTMENT</option>
                      <option value="CREDIT_GRANT">CREDIT_GRANT</option>
                      <option value="REVERSAL">REVERSAL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Reason for Audit Trail (Mandatory)
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Promotional credit grant for beta brand partner onboarding..."
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
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
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Execute Adjustment
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
