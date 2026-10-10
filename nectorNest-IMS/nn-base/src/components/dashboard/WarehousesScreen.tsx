import React from 'react';
import { Card, Chip, Button, ProgressBar } from '@thoughtstream/ui';
import {
  Warehouse,
  Plus,
  Compass,
  Thermometer,
  Truck,
} from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  code: string;
  region: string;
  sqft: string;
  capacityPct: number;
  skusCount: string;
  climate: string;
  lanes: string[];
  zones: { label: string; pct: number }[];
  status: 'operational' | 'high-load' | 'maintenance';
}

const FACILITIES: Facility[] = [
  {
    id: 'sea',
    name: 'Seattle Hub Facility',
    code: 'CELL-NORTH-01',
    region: 'Pacific Northwest • Washington',
    sqft: '420,000 sq ft',
    capacityPct: 82,
    skusCount: '8,920 SKUs',
    climate: '+4°C Cold Vault & Ambient Controlled',
    lanes: ['LANE-01 (to Chicago)', 'LANE-04 (Intra-state)', 'LANE-07 (Canada Express)'],
    zones: [
      { label: 'Bulk Pallet', pct: 45 },
      { label: 'Dynamic Pick Modules', pct: 35 },
      { label: 'Cold Vault', pct: 20 },
    ],
    status: 'operational',
  },
  {
    id: 'chi',
    name: 'Chicago Logistics Base',
    code: 'CELL-CENTRAL-02',
    region: 'Midwest Intermodal Corridor • Illinois',
    sqft: '380,000 sq ft',
    capacityPct: 67,
    skusCount: '4,210 SKUs',
    climate: 'Ambient 18°C-22°C Monitored',
    lanes: ['LANE-02 (to Seattle)', 'LANE-05 (to Newark)'],
    zones: [
      { label: 'Rail Cross-Dock', pct: 50 },
      { label: 'Automated ASRS', pct: 30 },
      { label: 'Buffer Storage', pct: 20 },
    ],
    status: 'operational',
  },
  {
    id: 'lax',
    name: 'Los Angeles Depot',
    code: 'CELL-PACIFIC-03',
    region: 'Port of Long Beach / LA • California',
    sqft: '480,000 sq ft',
    capacityPct: 91,
    skusCount: '7,150 SKUs',
    climate: 'Customs Bonded Zone • Ambient',
    lanes: ['LANE-03 (to Seattle)', 'LANE-08 (to Newark)'],
    zones: [
      { label: 'Customs Bonded', pct: 40 },
      { label: 'Pallet Racks', pct: 40 },
      { label: 'Fast Dispatch', pct: 20 },
    ],
    status: 'high-load',
  },
  {
    id: 'ewr',
    name: 'Newark Distribution Cell',
    code: 'CELL-EAST-04',
    region: 'Tri-State Gateway • New Jersey',
    sqft: '260,000 sq ft',
    capacityPct: 58,
    skusCount: '4,300 SKUs',
    climate: 'High Security Secure Vault & Air Cargo',
    lanes: ['LANE-06 (to Chicago)'],
    zones: [
      { label: 'Air Cargo Staging', pct: 50 },
      { label: 'High Density Shelves', pct: 35 },
      { label: 'Reverse Logistics', pct: 15 },
    ],
    status: 'operational',
  },
];

export const WarehousesScreen: React.FC = () => {
  return (
    <div className="nn-screen-content">
      {/* Header */}
      <div className="nn-dashboard-header">
        <div>
          <h1 className="nn-dashboard-title">Fulfillment Warehouses</h1>
          <p className="nn-dashboard-subtitle">
            Distributed storage network, capacity utilization meters, and environmental climate controls.
          </p>
        </div>
        <div className="nn-dashboard-actions">
          <Button variant="secondary" size="small" leftIcon={<Compass size={14} />}>
            Rebalance Storage
          </Button>
          <Button variant="primary" size="small" leftIcon={<Plus size={14} />}>
            Register Node
          </Button>
        </div>
      </div>

      {/* Network Summary Banner */}
      <div className="nn-banner-card">
        <div className="nn-banner-metric">
          <span className="nn-banner-label">Total Facilities</span>
          <span className="nn-banner-value">4 Nodes</span>
        </div>
        <div className="nn-banner-divider" />
        <div className="nn-banner-metric">
          <span className="nn-banner-label">Total Floor Space</span>
          <span className="nn-banner-value">1,540,000 sq ft</span>
        </div>
        <div className="nn-banner-divider" />
        <div className="nn-banner-metric">
          <span className="nn-banner-label">Average Utilization</span>
          <span className="nn-banner-value">74.5%</span>
        </div>
        <div className="nn-banner-divider" />
        <div className="nn-banner-metric">
          <span className="nn-banner-label">Climate Integrity</span>
          <span className="nn-banner-value">100% SLA</span>
        </div>
      </div>

      {/* Facility Grid */}
      <div className="nn-facilities-grid">
        {FACILITIES.map((fac) => (
          <Card key={fac.id} variant="default" padding="medium" className="nn-facility-card">
            <div className="nn-facility-card-head">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Warehouse size={16} />
                  <h3 className="nn-facility-name">{fac.name}</h3>
                </div>
                <div className="nn-facility-region">{fac.region}</div>
              </div>
              <div>
                {fac.status === 'operational' && (
                  <Chip variant="status" tone="success">
                    Operational
                  </Chip>
                )}
                {fac.status === 'high-load' && (
                  <Chip variant="status" tone="warning">
                    High Load (91%)
                  </Chip>
                )}
              </div>
            </div>

            {/* Capacity Meter */}
            <div className="nn-facility-capacity">
              <div className="nn-capacity-labels">
                <span className="nn-metric-label">Rack & Floor Utilization</span>
                <span className="nn-mono-bold">{fac.capacityPct}%</span>
              </div>
              <ProgressBar
                value={fac.capacityPct}
                variant={fac.capacityPct > 85 ? 'warning' : 'primary'}
                size="sm"
              />
            </div>

            {/* Metrics Breakdown */}
            <div className="nn-facility-meta-grid">
              <div className="nn-facility-meta-item">
                <span className="nn-facility-meta-label">Identifier</span>
                <span className="nn-mono-bold">{fac.code}</span>
              </div>
              <div className="nn-facility-meta-item">
                <span className="nn-facility-meta-label">Total Floor Space</span>
                <span className="nn-facility-meta-val">{fac.sqft}</span>
              </div>
              <div className="nn-facility-meta-item">
                <span className="nn-facility-meta-label">Active SKUs</span>
                <span className="nn-mono-bold">{fac.skusCount}</span>
              </div>
              <div className="nn-facility-meta-item">
                <span className="nn-facility-meta-label">Climate Control</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Thermometer size={12} style={{ color: 'var(--ts-color-success)' }} />
                  <span className="nn-facility-meta-val">{fac.climate}</span>
                </div>
              </div>
            </div>

            {/* Zone Distribution */}
            <div className="nn-facility-zones">
              <span className="nn-metric-label">Zone Allocations</span>
              <div className="nn-zone-chips">
                {fac.zones.map((zone, zIdx) => (
                  <span key={zIdx} className="nn-zone-pill">
                    {zone.label}: <strong className="nn-mono-text">{zone.pct}%</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Fleet Lanes */}
            <div className="nn-facility-lanes">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Truck size={13} style={{ color: 'var(--ts-color-text-tertiary)' }} />
                <span className="nn-metric-label">Assigned Freight Lanes</span>
              </div>
              <div className="nn-facility-lane-tags">
                {fac.lanes.map((lane, lIdx) => (
                  <span key={lIdx} className="nn-lane-tag">
                    {lane}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
