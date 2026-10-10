import React from 'react';
import { Card, Chip, Button, ProgressBar } from '@thoughtstream/ui';
import {
  Truck,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  Compass,
  FileText,
} from 'lucide-react';

interface TransitLane {
  id: string;
  code: string;
  origin: string;
  destination: string;
  carrier: string;
  progress: number;
  eta: string;
  cargo: string;
  seal: string;
  status: 'in-transit' | 'cleared' | 'scheduled';
}

const LANES: TransitLane[] = [
  {
    id: 'l1',
    code: 'LANE-01',
    origin: 'Seattle Hub',
    destination: 'Chicago Base',
    carrier: 'SwiftLine Freight • Truck #581',
    progress: 72,
    eta: '4h 20m (Today 18:42 UTC)',
    cargo: '18 Pallets • 4,200 kg',
    seal: '0x4f8a...c901',
    status: 'in-transit',
  },
  {
    id: 'l3',
    code: 'LANE-03',
    origin: 'Los Angeles Depot',
    destination: 'Seattle Hub',
    carrier: 'Pacific Edge Rail • Car #902',
    progress: 90,
    eta: '1h 15m (Today 15:35 UTC)',
    cargo: '24 Pallets • 6,100 kg',
    seal: '0x19ba...382e',
    status: 'in-transit',
  },
  {
    id: 'l6',
    code: 'LANE-06',
    origin: 'Newark Cell',
    destination: 'Chicago Base',
    carrier: 'Apex Intermodal • Flight #AX802',
    progress: 35,
    eta: '12h 40m (Tomorrow 03:00 UTC)',
    cargo: '14 Pallets • 2,900 kg',
    seal: '0x88fe...bb12',
    status: 'in-transit',
  },
  {
    id: 'l8',
    code: 'LANE-08',
    origin: 'Los Angeles Depot',
    destination: 'Newark Distribution',
    carrier: 'Continental Ground • Convoy #12',
    progress: 10,
    eta: '18h 30m (Tomorrow 08:50 UTC)',
    cargo: '30 Pallets • 8,400 kg',
    seal: '0x992a...fa44',
    status: 'scheduled',
  },
];

export const FleetScreen: React.FC = () => {
  return (
    <div className="nn-screen-content">
      {/* Header */}
      <div className="nn-dashboard-header">
        <div>
          <h1 className="nn-dashboard-title">Fleet & Dispatch Lanes</h1>
          <p className="nn-dashboard-subtitle">
            Inter-facility freight telemetry, cryptographic seal verification, and automated lane schedules.
          </p>
        </div>
        <div className="nn-dashboard-actions">
          <Button variant="secondary" size="small" leftIcon={<FileText size={14} />}>
            Export Manifests
          </Button>
          <Button variant="primary" size="small" leftIcon={<Plus size={14} />}>
            New Dispatch
          </Button>
        </div>
      </div>

      {/* Fleet KPI Banner */}
      <section className="nn-dashboard-metrics-grid" aria-label="Fleet Metrics">
        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">In-Flight Cargo Valuation</span>
          <span className="nn-metric-value">$1,820,500</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <span>342 Containers total</span>
          </div>
        </Card>

        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">Active Freight Lanes</span>
          <span className="nn-metric-value">8 Active</span>
          <div className="nn-metric-trend">
            <span>4 Inter-region, 4 Regional</span>
          </div>
        </Card>

        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">On-Time Transit SLA</span>
          <span className="nn-metric-value">99.4%</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <span>Target &gt;= 98.5%</span>
          </div>
        </Card>

        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">Cryptographic Seal Rate</span>
          <span className="nn-metric-value">100.0%</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <ShieldCheck size={14} />
            <span>Zero tampering events</span>
          </div>
        </Card>
      </section>

      {/* Live Transit Lanes Tracker */}
      <div className="nn-lanes-section">
        <div className="nn-nodes-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={16} />
            <h3 className="nn-section-heading">Active Freight Corridors</h3>
          </div>
          <span className="nn-mono-caption">Updated 30s ago</span>
        </div>

        <div className="nn-lanes-grid">
          {LANES.map((lane) => (
            <Card key={lane.id} variant="default" padding="medium" className="nn-lane-card">
              <div className="nn-lane-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={15} />
                  <span className="nn-mono-bold">{lane.code}</span>
                </div>
                <div>
                  {lane.status === 'in-transit' && (
                    <Chip variant="status" tone="info">
                      In Transit
                    </Chip>
                  )}
                  {lane.status === 'scheduled' && (
                    <Chip variant="status" tone="warning">
                      Scheduled
                    </Chip>
                  )}
                </div>
              </div>

              {/* Route Indicator */}
              <div className="nn-lane-route">
                <span className="nn-lane-stop">{lane.origin}</span>
                <ArrowRight size={14} className="nn-lane-arrow" />
                <span className="nn-lane-stop">{lane.destination}</span>
              </div>

              {/* Progress */}
              <div className="nn-lane-progress-wrap">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="nn-metric-label">Route Completion</span>
                  <span className="nn-mono-bold">{lane.progress}%</span>
                </div>
                <ProgressBar
                  value={lane.progress}
                  variant={lane.progress > 80 ? 'success' : 'primary'}
                  size="sm"
                />
              </div>

              {/* Meta information */}
              <div className="nn-lane-meta">
                <div className="nn-lane-meta-row">
                  <span className="nn-metric-label">Carrier</span>
                  <span className="nn-lane-meta-val">{lane.carrier}</span>
                </div>
                <div className="nn-lane-meta-row">
                  <span className="nn-metric-label">Estimated Arrival</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    <span className="nn-mono-text">{lane.eta}</span>
                  </div>
                </div>
                <div className="nn-lane-meta-row">
                  <span className="nn-metric-label">Cargo Manifest</span>
                  <span className="nn-lane-meta-val">{lane.cargo}</span>
                </div>
                <div className="nn-lane-meta-row">
                  <span className="nn-metric-label">Digital Seal Hash</span>
                  <span className="nn-mono-caption">{lane.seal}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
