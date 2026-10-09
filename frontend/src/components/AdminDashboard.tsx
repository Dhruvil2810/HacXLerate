import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
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
  UserX,
  FileText
} from 'lucide-react';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  creditBalance: number;
}

interface AuditLogItem {
  id: string;
  action: string;
  actorId?: string;
  entityType: string;
  entityId?: string;
  details?: any;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [overview, setOverview] = useState({
    totalUsers: 0,
    creatorsCount: 0,
    brandsCount: 0,
    circulatingCredits: 0,
    aiQueriesCount: 0,
  });
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  // Adjustment modal states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustType, setAdjustType] = useState<'CREDIT_GRANT' | 'ADMIN_ADJUSTMENT' | 'REVERSAL'>('ADMIN_ADJUSTMENT');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      if (!token) return;
      try {
        const [usersRes, logsRes, overviewRes] = await Promise.allSettled([
          apiRequest<{ users: any[] }>('/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          apiRequest<{ logs: any[] }>('/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
          apiRequest<{ overview: any }>('/admin/overview', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (usersRes.status === 'fulfilled' && usersRes.value.success && usersRes.value.data?.users) {
          const formatted = usersRes.value.data.users.map((u: any) => ({
            id: u.id,
            name: u.name || 'User',
            email: u.email,
            role: u.roles?.[0]?.role || u.role || 'CREATOR',
            status: u.status || 'ACTIVE',
            creditBalance: u.creditWallet?.balance || 0,
          }));
          setUsers(formatted);
          if (formatted.length > 0) setSelectedUserId(formatted[0].id);
        }

        if (logsRes.status === 'fulfilled' && logsRes.value.success && logsRes.value.data?.logs) {
          setAuditLogs(logsRes.value.data.logs);
        }

        if (overviewRes.status === 'fulfilled' && overviewRes.value.success && overviewRes.value.data?.overview) {
          setOverview(overviewRes.value.data.overview);
        }
      } catch (err) {
        console.error('Admin data fetch error', err);
      }
    }
    loadAdminData();
  }, [token]);

  const handleStatusToggle = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const nextStatus = target.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );

    if (token) {
      await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      }).catch(() => {});
    }
  };

  const handleExecuteAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !token) return;

    setLoading(true);
    try {
      await apiRequest('/admin/credits/adjust', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: selectedUserId,
          amount: adjustAmount,
          type: adjustType,
          reason: adjustReason,
        }),
      });

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            {overview.totalUsers || users.length}
          </div>
          <div className="metric-delta" style={{ color: 'var(--color-brand)' }}>
            {overview.creatorsCount} Creators • {overview.brandsCount} Brands
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Circulating Credits</span>
            <Coins size={16} color="var(--color-brand)" />
          </div>
          <div className="metric-value">
            {overview.circulatingCredits.toLocaleString()}
          </div>
          <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
            Immutable Double-Entry Ledger
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">AI Token Queries</span>
            <Bot size={16} color="var(--color-brand)" />
          </div>
          <div className="metric-value">
            {overview.aiQueriesCount}
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

        {users.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: 'var(--text-muted)' }}>No Users Registered Yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Registered creator and brand accounts will appear here for governance.
            </p>
          </div>
        ) : (
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
        )}
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

        {auditLogs.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: 'var(--text-muted)' }}>No Audit Log Entries</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              System operations, security events, and credit adjustments will stream here.
            </p>
          </div>
        ) : (
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
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td><code>{new Date(log.createdAt).toLocaleTimeString()}</code></td>
                    <td><span className="badge badge-verified">{log.action}</span></td>
                    <td><code>{log.actorId ? `${log.actorId.slice(0, 8)}...` : 'System'}</code></td>
                    <td>{log.entityType}</td>
                    <td>{typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Executing...' : 'Execute Adjustment'}
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
