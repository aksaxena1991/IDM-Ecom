import React from 'react';
import { Card, Chip, Button } from '@thoughtstream/ui';
import {
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Download,
  Send,
  Sparkles,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export interface OverviewScreenProps {
  onNavigateToTab?: (tab: string) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({ onNavigateToTab }) => {
  return (
    <div className="nn-screen-content">
      {/* Header Section */}
      <div className="nn-dashboard-header">
        <div>
          <h1 className="nn-dashboard-title">Operations Sanctuary</h1>
          <p className="nn-dashboard-subtitle">
            Distraction-free inventory velocity, node synchronization, and fulfillment ledger.
          </p>
        </div>
        <div className="nn-dashboard-actions">
          <Button
            variant="secondary"
            size="small"
            leftIcon={<Download size={14} />}
            onClick={() => onNavigateToTab?.('analytics')}
          >
            Download Ledger
          </Button>
          <Button
            variant="primary"
            size="small"
            leftIcon={<Send size={14} />}
            onClick={() => onNavigateToTab?.('orders')}
          >
            Dispatch Order
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <section className="nn-dashboard-metrics-grid" aria-label="Key Performance Indicators">
        <Card
          variant="default"
          padding="medium"
          className="nn-metric-card"
          interactive
          onClick={() => onNavigateToTab?.('inventory')}
        >
          <span className="nn-metric-label">Catalog SKUs</span>
          <span className="nn-metric-value">24,580</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <ArrowUpRight size={14} />
            <span>+12.4% vs last cycle</span>
          </div>
        </Card>

        <Card
          variant="default"
          padding="medium"
          className="nn-metric-card"
          interactive
          onClick={() => onNavigateToTab?.('fleet')}
        >
          <span className="nn-metric-label">In-Transit Shipments</span>
          <span className="nn-metric-value">342</span>
          <div className="nn-metric-trend">
            <span>8 active fleet lanes</span>
          </div>
        </Card>

        <Card
          variant="default"
          padding="medium"
          className="nn-metric-card"
          interactive
          onClick={() => onNavigateToTab?.('warehouses')}
        >
          <span className="nn-metric-label">Warehouse Capacity</span>
          <span className="nn-metric-value">78.2%</span>
          <div className="nn-metric-trend">
            <span>Optimal distribution</span>
          </div>
        </Card>

        <Card
          variant="default"
          padding="medium"
          className="nn-metric-card"
          interactive
          onClick={() => onNavigateToTab?.('analytics')}
        >
          <span className="nn-metric-label">Node Sync Latency</span>
          <span className="nn-metric-value">12ms</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <Activity size={14} />
            <span>Zero backpressure</span>
          </div>
        </Card>
      </section>

      {/* Active Fulfillment Cells Table */}
      <section className="nn-nodes-table-wrap" aria-label="Fulfillment Nodes Ledger">
        <div className="nn-nodes-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} style={{ color: 'var(--ts-color-success)' }} />
            <h3 className="nn-section-heading">Active Fulfillment Cells</h3>
          </div>
          <span className="nn-mono-caption">4 Nodes Synchronized</span>
        </div>

        <div className="nn-table-scroll">
          <table className="nn-nodes-table">
            <thead>
              <tr>
                <th>Cell Identifier</th>
                <th>Facility Region</th>
                <th>Active Inventory</th>
                <th>Fleet Lanes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="nn-mono-bold">CELL-NORTH-01</td>
                <td>Seattle Hub Facility</td>
                <td className="nn-mono-text">8,920 SKUs</td>
                <td>3 Dedicated</td>
                <td>
                  <Chip variant="status" tone="success">
                    Synchronized
                  </Chip>
                </td>
              </tr>
              <tr>
                <td className="nn-mono-bold">CELL-CENTRAL-02</td>
                <td>Chicago Logistics Base</td>
                <td className="nn-mono-text">4,210 SKUs</td>
                <td>2 Dedicated</td>
                <td>
                  <Chip variant="status" tone="success">
                    Synchronized
                  </Chip>
                </td>
              </tr>
              <tr>
                <td className="nn-mono-bold">CELL-PACIFIC-03</td>
                <td>Los Angeles Depot</td>
                <td className="nn-mono-text">7,150 SKUs</td>
                <td>2 Dedicated</td>
                <td>
                  <Chip variant="status" tone="warning">
                    High Load (91%)
                  </Chip>
                </td>
              </tr>
              <tr>
                <td className="nn-mono-bold">CELL-EAST-04</td>
                <td>Newark Distribution Cell</td>
                <td className="nn-mono-text">4,300 SKUs</td>
                <td>1 Dedicated</td>
                <td>
                  <Chip variant="status" tone="success">
                    Synchronized
                  </Chip>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Live Operations Telemetry Stream */}
      <section className="nn-telemetry-panel" aria-label="Operations Telemetry Stream">
        <div className="nn-nodes-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} style={{ color: 'var(--ts-color-text-primary)' }} />
            <h3 className="nn-section-heading">Real-Time Telemetry Feed</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="nn-pulse-dot" />
            <span className="nn-mono-caption">Live Stream Active</span>
          </div>
        </div>

        <div className="nn-telemetry-list">
          <div className="nn-telemetry-item">
            <Clock size={13} className="nn-telemetry-icon" />
            <span className="nn-telemetry-time">14:22:04 UTC</span>
            <span className="nn-telemetry-badge">DISPATCH</span>
            <span className="nn-telemetry-desc">
              Manifest MNF-2026-9042 departed Seattle Hub bound for Chicago Base. 18 pallets sealed.
            </span>
            <Chip variant="status" tone="info" className="nn-telemetry-tag">
              LANE-01
            </Chip>
          </div>

          <div className="nn-telemetry-item">
            <ShieldCheck size={13} className="nn-telemetry-icon" />
            <span className="nn-telemetry-time">14:18:19 UTC</span>
            <span className="nn-telemetry-badge">LEDGER</span>
            <span className="nn-telemetry-desc">
              Block #1,048,291 custody transfer attested by operator OP-SEATTLE-01. SHA-256 root verified.
            </span>
            <Chip variant="status" tone="success" className="nn-telemetry-tag">
              Verified
            </Chip>
          </div>

          <div className="nn-telemetry-item">
            <RefreshCw size={13} className="nn-telemetry-icon" />
            <span className="nn-telemetry-time">14:05:40 UTC</span>
            <span className="nn-telemetry-badge">REBALANCE</span>
            <span className="nn-telemetry-desc">
              Automatic replenishment order issued for 120 units of Photonic Transceiver (SKU-NX-8401).
            </span>
            <Chip variant="status" tone="warning" className="nn-telemetry-tag">
              Reorder
            </Chip>
          </div>
        </div>
      </section>
    </div>
  );
};
