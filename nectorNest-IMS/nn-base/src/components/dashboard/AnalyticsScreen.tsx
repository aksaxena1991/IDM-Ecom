import React from 'react';
import { Card, Chip, Button } from '@thoughtstream/ui';
import {
  Download,
  ShieldCheck,
  Activity,
  Lock,
} from 'lucide-react';

interface AuditBlock {
  height: string;
  eventType: string;
  initiator: string;
  timestamp: string;
  merkleRoot: string;
  status: 'verified';
}

const AUDIT_BLOCKS: AuditBlock[] = [
  {
    height: '#1,048,291',
    eventType: 'CUSTODY_TRANSFER_EXEC',
    initiator: 'OP-SEATTLE-01 [0x8f2c...419a]',
    timestamp: '2026-10-10 14:18:19 UTC',
    merkleRoot: 'sha256:4b91e92d770c8f1a...de23',
    status: 'verified',
  },
  {
    height: '#1,048,290',
    eventType: 'INVENTORY_INGEST_SYNC',
    initiator: 'NODE-CHICAGO-02 [0x31b9...a220]',
    timestamp: '2026-10-10 13:45:02 UTC',
    merkleRoot: 'sha256:9981ae4412ef843a...cc78',
    status: 'verified',
  },
  {
    height: '#1,048,289',
    eventType: 'REORDER_TRIGGER_AUTO',
    initiator: 'AUTO-WORKER-REPL-03 [0x19a4...ff01]',
    timestamp: '2026-10-10 13:10:44 UTC',
    merkleRoot: 'sha256:bb40129cf9941a80...1192',
    status: 'verified',
  },
  {
    height: '#1,048,288',
    eventType: 'CYCLE_COUNT_ATTESTATION',
    initiator: 'OP-LAX-03 [0x77d1...99bc]',
    timestamp: '2026-10-10 12:00:15 UTC',
    merkleRoot: 'sha256:6630f9a911e3b551...ee41',
    status: 'verified',
  },
  {
    height: '#1,048,287',
    eventType: 'DISPATCH_SEAL_RECORDED',
    initiator: 'FLEET-CONTROLLER [0x50ab...2284]',
    timestamp: '2026-10-10 11:32:50 UTC',
    merkleRoot: 'sha256:2218ffbc33a9018e...88ab',
    status: 'verified',
  },
];

export const AnalyticsScreen: React.FC = () => {
  return (
    <div className="nn-screen-content">
      {/* Header */}
      <div className="nn-dashboard-header">
        <div>
          <h1 className="nn-dashboard-title">Ledgers & Telemetry Analytics</h1>
          <p className="nn-dashboard-subtitle">
            Cryptographic ledger attestations, throughput velocity metrics, and immutable audit logs.
          </p>
        </div>
        <div className="nn-dashboard-actions">
          <Button variant="secondary" size="small" leftIcon={<Lock size={14} />}>
            Verify Root Hashes
          </Button>
          <Button variant="primary" size="small" leftIcon={<Download size={14} />}>
            Export Audit Ledger
          </Button>
        </div>
      </div>

      {/* Velocity and SLA KPIs */}
      <section className="nn-dashboard-metrics-grid" aria-label="Velocity KPIs">
        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">Network Pick Velocity</span>
          <span className="nn-metric-value">412 Units/Hr</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <Activity size={14} />
            <span>+8.1% vs previous week</span>
          </div>
        </Card>

        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">Mean Dock-To-Stock</span>
          <span className="nn-metric-value">48 Minutes</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <span>Target &lt; 60m (Exceeded)</span>
          </div>
        </Card>

        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">Inventory Accuracy Rate</span>
          <span className="nn-metric-value">99.98%</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <span>Cycle count attested</span>
          </div>
        </Card>

        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">Ledger Integrity Hash</span>
          <span className="nn-metric-value">100.0%</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <ShieldCheck size={14} />
            <span>Zero Merkle divergence</span>
          </div>
        </Card>
      </section>

      {/* Cryptographic Audit Ledger Table */}
      <section className="nn-nodes-table-wrap" aria-label="Cryptographic Audit Ledger">
        <div className="nn-nodes-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={16} style={{ color: 'var(--ts-color-success)' }} />
            <h3 className="nn-section-heading">Cryptographic Event Ledger</h3>
          </div>
          <span className="nn-mono-caption">Block Stream Synced</span>
        </div>

        <div className="nn-table-scroll">
          <table className="nn-nodes-table">
            <thead>
              <tr>
                <th>Block Height</th>
                <th>Event Taxonomy</th>
                <th>Initiator Node</th>
                <th>Timestamp (UTC)</th>
                <th>Merkle Root Hash</th>
                <th>Integrity</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_BLOCKS.map((blk) => (
                <tr key={blk.height}>
                  <td className="nn-mono-bold">{blk.height}</td>
                  <td>
                    <span className="nn-telemetry-badge">{blk.eventType}</span>
                  </td>
                  <td className="nn-mono-text" style={{ fontSize: '0.8125rem' }}>
                    {blk.initiator}
                  </td>
                  <td className="nn-mono-caption">{blk.timestamp}</td>
                  <td className="nn-mono-caption" style={{ color: 'var(--ts-color-text-secondary)' }}>
                    {blk.merkleRoot}
                  </td>
                  <td>
                    <Chip variant="status" tone="success">
                      Verified
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
