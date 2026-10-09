import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Filter, 
  Lock,
  FileText,
  X,
  CheckCircle2
} from 'lucide-react';

interface LedgerEntry {
  id: string;
  amount: number;
  type: 'CREDIT_GRANT' | 'AI_USAGE' | 'CAMPAIGN_REWARD' | 'CAMPAIGN_RESERVATION' | 'CAMPAIGN_RELEASE' | 'ADMIN_ADJUSTMENT';
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export const WalletLedgerView: React.FC = () => {
  const { user, token, refreshProfile } = useAuth();
  const wallet = user?.creditWallet;
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  const loadLedger = async () => {
    if (!token) return;
    try {
      const res = await apiRequest<{ entries: LedgerEntry[] }>('/credits/ledger', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.success && res.data?.entries) {
        setEntries(res.data.entries);
      }
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [token]);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || topUpAmount <= 0) return;
    setIsToppingUp(true);
    try {
      const res = await apiRequest('/credits/top-up', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: Number(topUpAmount),
          description: `Direct Credit Deposit (+${Number(topUpAmount).toLocaleString()})`
        })
      });
      if (res.success) {
        setTopUpSuccess(true);
        await refreshProfile();
        await loadLedger();
        setTimeout(() => {
          setTopUpSuccess(false);
          setIsTopUpOpen(false);
        }, 1500);
      }
    } catch (err: any) {
      alert(`Top-up failed: ${err.message || 'Server error'}`);
    } finally {
      setIsToppingUp(false);
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (selectedType === 'ALL') return true;
    return e.type === selectedType;
  });

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'CREDIT_GRANT':
        return <span className="badge badge-verified">CREDIT_GRANT</span>;
      case 'CAMPAIGN_REWARD':
        return <span className="badge badge-verified">CAMPAIGN_REWARD</span>;
      case 'CAMPAIGN_RESERVATION':
        return <span className="badge badge-uploaded">CAMPAIGN_RESERVATION</span>;
      case 'AI_USAGE':
        return <span className="badge badge-neutral">AI_USAGE</span>;
      case 'ADMIN_ADJUSTMENT':
        return <span className="badge badge-selfreported">ADMIN_ADJUSTMENT</span>;
      default:
        return <span className="badge badge-neutral">{type}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Wallet Balance Hero Card */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderLeft: '4px solid var(--color-brand)' 
      }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-verified" style={{ marginBottom: '0.5rem' }}>
              <ShieldCheck size={12} /> Immutable Ledger Wallet
            </div>
            <h2>Platform Credit Balance</h2>
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
              Internal accounting unit for campaign escrow reservations, verified CPM rewards, and AI operations.
            </p>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Available Balance
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                {wallet?.balance !== undefined ? wallet.balance.toLocaleString() : '0'} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Credits</span>
              </div>
            </div>
            <button
              onClick={() => setIsTopUpOpen(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              id="btn-top-up-credits"
            >
              <Coins size={14} /> + Top Up Credits
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Statistics Breakdown */}
      <div className="grid grid-cols-4 gap-4">
        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Available Balance</span>
            <Coins size={16} color="var(--color-brand)" />
          </div>
          <div className="metric-value">
            {wallet?.balance ? wallet.balance.toLocaleString() : '0'}
          </div>
          <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
            Ready for campaign use
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Reserved in Escrow</span>
            <Lock size={16} color="var(--color-info)" />
          </div>
          <div className="metric-value">
            {wallet?.reservedBalance ? wallet.reservedBalance.toLocaleString() : '0'}
          </div>
          <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
            Committed to active campaigns
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Total Allocated</span>
            <ArrowUpRight size={16} color="var(--color-success)" />
          </div>
          <div className="metric-value">
            {((wallet?.balance || 0) + (wallet?.reservedBalance || 0)).toLocaleString()}
          </div>
          <div className="metric-delta" style={{ color: 'var(--color-success)' }}>
            Total credit pool
          </div>
        </div>

        <div className="metric-box">
          <div className="flex items-center justify-between">
            <span className="metric-label">Ledger Transactions</span>
            <ArrowDownLeft size={16} color="var(--text-muted)" />
          </div>
          <div className="metric-value">
            {entries.length}
          </div>
          <div className="metric-delta" style={{ color: 'var(--text-muted)' }}>
            Verified double-entry events
          </div>
        </div>
      </div>

      {/* Immutable Ledger Table */}
      <div className="card">
        <div className="card-header flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3>Double-Entry Credit Ledger</h3>
            <p style={{ fontSize: '0.85rem' }}>
              Every transaction generates an immutable append-only record with cryptographic verification.
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                fontSize: '0.8rem',
              }}
            >
              <option value="ALL">All Transactions</option>
              <option value="CREDIT_GRANT">Credit Grants</option>
              <option value="CAMPAIGN_RESERVATION">Campaign Escrow</option>
              <option value="CAMPAIGN_REWARD">Campaign Rewards</option>
              <option value="AI_USAGE">AI Usage</option>
              <option value="ADMIN_ADJUSTMENT">Admin Adjustments</option>
            </select>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: 'var(--text-muted)' }}>No Ledger Transactions Found</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Transactions will be permanently logged here as grants, AI actions, or campaign payouts occur.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Transaction Type</th>
                  <th>Description</th>
                  <th>Reference</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const isPositive = entry.amount > 0;

                  return (
                    <tr key={entry.id}>
                      <td><code>{entry.createdAt}</code></td>
                      <td>{getTransactionBadge(entry.type)}</td>
                      <td style={{ maxWidth: '400px' }}>
                        <div style={{ fontWeight: 500 }}>{entry.description}</div>
                      </td>
                      <td>
                        {entry.referenceType ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {entry.referenceType} ({entry.referenceId})
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isPositive ? 'var(--color-success)' : 'var(--text-primary)',
                        }}>
                          {isPositive ? `+${entry.amount.toLocaleString()}` : `${entry.amount.toLocaleString()}`} Credits
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Credit Top-Up Modal */}
      {isTopUpOpen && (
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
            maxWidth: '480px',
            padding: '2rem',
            position: 'relative',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <button
              onClick={() => setIsTopUpOpen(false)}
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
                <Coins size={12} /> Instant Account Top-Up
              </div>
              <h3>Deposit Platform Credits</h3>
              <p style={{ fontSize: '0.85rem' }}>
                Acquire internal credits for campaign escrow pools and AI intelligence workflows.
              </p>
            </div>

            {topUpSuccess && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#dcfce7',
                color: '#166534',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <CheckCircle2 size={16} />
                Credits deposited successfully! Ledger updated.
              </div>
            )}

            <form onSubmit={handleTopUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Quick Amount Presets
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setTopUpAmount(amt)}
                      className={`btn ${topUpAmount === amt ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.2rem' }}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Custom Deposit Amount (Credits)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100000"
                  step="10"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsTopUpOpen(false)}
                  className="btn btn-secondary"
                  disabled={isToppingUp}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isToppingUp || topUpAmount <= 0}
                  className="btn btn-primary"
                  id="confirm-top-up-btn"
                >
                  {isToppingUp ? 'Depositing...' : `Confirm Deposit (+${topUpAmount.toLocaleString()})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
