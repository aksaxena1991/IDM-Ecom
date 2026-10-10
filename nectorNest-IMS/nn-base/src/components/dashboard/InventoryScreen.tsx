import React, { useState, useMemo } from 'react';
import { Card, Chip, Button, Input } from '@thoughtstream/ui';
import {
  Search,
  Plus,
  Download,
  AlertTriangle,
  Package,
} from 'lucide-react';

interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  facility: string;
  bin: string;
  onHand: number;
  reserved: number;
  reorderPoint: number;
  unitCost: string;
  status: 'in-stock' | 'low-stock' | 'critical';
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    sku: 'SKU-NX-8401',
    name: 'Photonic Transceiver 400G Single-Mode',
    category: 'Optics & Fiber',
    facility: 'Seattle Hub',
    bin: 'BIN-A-14-3',
    onHand: 1840,
    reserved: 120,
    reorderPoint: 400,
    unitCost: '$240.00',
    status: 'in-stock',
  },
  {
    sku: 'SKU-NX-9102',
    name: 'Edge GPU Compute Module 32GB',
    category: 'Compute & Logic',
    facility: 'Chicago Base',
    bin: 'BIN-C-02-8',
    onHand: 42,
    reserved: 15,
    reorderPoint: 50,
    unitCost: '$1,150.00',
    status: 'low-stock',
  },
  {
    sku: 'SKU-NX-7304',
    name: 'Lithium Polymer Battery Unit 5000mAh',
    category: 'Power Systems',
    facility: 'Los Angeles Depot',
    bin: 'BIN-L-19-1',
    onHand: 620,
    reserved: 80,
    reorderPoint: 200,
    unitCost: '$38.50',
    status: 'in-stock',
  },
  {
    sku: 'SKU-NX-6209',
    name: 'Titanium Edge Bracket Assembly',
    category: 'Structural Enclosures',
    facility: 'Newark Cell',
    bin: 'BIN-N-04-2',
    onHand: 14,
    reserved: 10,
    reorderPoint: 80,
    unitCost: '$95.00',
    status: 'critical',
  },
  {
    sku: 'SKU-NX-5110',
    name: 'High-Frequency RFID Gate Interrogator',
    category: 'RF Transceivers',
    facility: 'Seattle Hub',
    bin: 'BIN-A-09-4',
    onHand: 340,
    reserved: 30,
    reorderPoint: 100,
    unitCost: '$410.00',
    status: 'in-stock',
  },
  {
    sku: 'SKU-NX-3821',
    name: 'Precision Armored Fiber Jumper 20m',
    category: 'Optics & Fiber',
    facility: 'Chicago Base',
    bin: 'BIN-C-11-5',
    onHand: 512,
    reserved: 45,
    reorderPoint: 150,
    unitCost: '$62.00',
    status: 'in-stock',
  },
  {
    sku: 'SKU-NX-2490',
    name: 'Cryogenic Coolant Coupler Valve',
    category: 'Thermal Management',
    facility: 'Los Angeles Depot',
    bin: 'BIN-L-08-6',
    onHand: 28,
    reserved: 20,
    reorderPoint: 45,
    unitCost: '$320.00',
    status: 'low-stock',
  },
];

export const InventoryScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'critical'>('all');

  const filteredItems = useMemo(() => {
    return INITIAL_INVENTORY.filter((item) => {
      const matchesSearch =
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.facility.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="nn-screen-content">
      {/* Header */}
      <div className="nn-dashboard-header">
        <div>
          <h1 className="nn-dashboard-title">Catalog & Stock Ledger</h1>
          <p className="nn-dashboard-subtitle">
            Global inventory valuation, automated reorder thresholds, and bin allocations across all nodes.
          </p>
        </div>
        <div className="nn-dashboard-actions">
          <Button variant="secondary" size="small" leftIcon={<Download size={14} />}>
            Export CSV
          </Button>
          <Button variant="primary" size="small" leftIcon={<Plus size={14} />}>
            Ingest Stock
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <section className="nn-dashboard-metrics-grid" aria-label="Inventory Metrics">
        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">Total Catalog Valuation</span>
          <span className="nn-metric-value">$4,892,100</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <span>24,580 units on hand</span>
          </div>
        </Card>

        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">Active SKU Count</span>
          <span className="nn-metric-value">1,240 SKUs</span>
          <div className="nn-metric-trend">
            <span>Across 4 regional hubs</span>
          </div>
        </Card>

        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">Low Stock Alerts</span>
          <span className="nn-metric-value">14 SKUs</span>
          <div className="nn-metric-trend" style={{ color: 'var(--ts-color-warning)' }}>
            <AlertTriangle size={13} />
            <span>Replenishment suggested</span>
          </div>
        </Card>

        <Card variant="default" padding="medium" className="nn-metric-card">
          <span className="nn-metric-label">Annualized Turn Rate</span>
          <span className="nn-metric-value">8.4x</span>
          <div className="nn-metric-trend nn-metric-trend--positive">
            <span>Top 5% quartile</span>
          </div>
        </Card>
      </section>

      {/* Filter and Search Bar */}
      <div className="nn-filter-bar">
        <div className="nn-search-wrap">
          <Input
            placeholder="Search SKU, item name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leadingIcon={<Search size={15} />}
          />
        </div>

        <div className="nn-filter-chips">
          <Chip
            variant="filter"
            selected={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            All Items ({INITIAL_INVENTORY.length})
          </Chip>
          <Chip
            variant="filter"
            selected={statusFilter === 'in-stock'}
            onClick={() => setStatusFilter('in-stock')}
          >
            In Stock (4)
          </Chip>
          <Chip
            variant="filter"
            selected={statusFilter === 'low-stock'}
            onClick={() => setStatusFilter('low-stock')}
          >
            Low Stock (2)
          </Chip>
          <Chip
            variant="filter"
            selected={statusFilter === 'critical'}
            onClick={() => setStatusFilter('critical')}
          >
            Critical (1)
          </Chip>
        </div>
      </div>

      {/* Inventory Table */}
      <section className="nn-nodes-table-wrap" aria-label="Inventory Stock Table">
        <div className="nn-nodes-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={16} style={{ color: 'var(--ts-color-text-primary)' }} />
            <h3 className="nn-section-heading">Verified SKU Registry</h3>
          </div>
          <span className="nn-mono-caption">
            Showing {filteredItems.length} of {INITIAL_INVENTORY.length} SKUs
          </span>
        </div>

        <div className="nn-table-scroll">
          <table className="nn-nodes-table">
            <thead>
              <tr>
                <th>SKU Identifier</th>
                <th>Item Specification</th>
                <th>Category</th>
                <th>Facility & Bin</th>
                <th>On Hand / Reserved</th>
                <th>Reorder Point</th>
                <th>Unit Valuation</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.sku}>
                  <td className="nn-mono-bold">{item.sku}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    <span>{item.facility}</span>
                    <span className="nn-mono-caption" style={{ display: 'block' }}>
                      {item.bin}
                    </span>
                  </td>
                  <td className="nn-mono-text">
                    {item.onHand.toLocaleString()}{' '}
                    <span style={{ color: 'var(--ts-color-text-tertiary)', fontSize: '0.75rem' }}>
                      ({item.reserved} rsv)
                    </span>
                  </td>
                  <td className="nn-mono-text">{item.reorderPoint}</td>
                  <td className="nn-mono-text">{item.unitCost}</td>
                  <td>
                    {item.status === 'in-stock' && (
                      <Chip variant="status" tone="success">
                        In Stock
                      </Chip>
                    )}
                    {item.status === 'low-stock' && (
                      <Chip variant="status" tone="warning">
                        Low Stock
                      </Chip>
                    )}
                    {item.status === 'critical' && (
                      <Chip variant="status" tone="error">
                        Critical
                      </Chip>
                    )}
                  </td>
                  <td>
                    <Button variant="ghost" size="small">
                      Transfer
                    </Button>
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
