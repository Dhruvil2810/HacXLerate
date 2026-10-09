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
  FileText
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
  const { user, token } = useAuth();
  const wallet = user?.creditWallet;
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  useEffect(() => {
    async function loadLedger() {
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
    }
    loadLedger();
  }, [token]);

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

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Available Balance
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-brand)' }}>
              {wallet?.balance ? wallet.balance.toLocaleString() : '0'} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Credits</span>
            </div>
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
    </div>
  );
};
