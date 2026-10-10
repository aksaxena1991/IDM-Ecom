import React, { useState } from 'react';
import { Chip, Button, Input } from '@thoughtstream/ui';
import {
  ClipboardCheck,
  Plus,
  Search,
  ArrowRight,
} from 'lucide-react';

interface TransferOrder {
  id: string;
  source: string;
  destination: string;
  priority: 'critical' | 'high' | 'standard';
  itemsCount: number;
  totalUnits: number;
  requestedBy: string;
  createdTime: string;
  slaDeadline: string;
  status: 'pending-pick' | 'in-pack' | 'in-transit' | 'delivered';
}

const ORDERS: TransferOrder[] = [
  {
    id: 'TRF-88192',
    source: 'Seattle Hub',
    destination: 'Chicago Base',
    priority: 'high',
    itemsCount: 14,
    totalUnits: 420,
    requestedBy: 'Automated Replenishment Worker #3',
    createdTime: '10-Oct 13:40 UTC',
    slaDeadline: '11-Oct 04:00 UTC (14h rem)',
    status: 'pending-pick',
  },
  {
    id: 'TRF-88190',
    source: 'Los Angeles Depot',
    destination: 'Seattle Hub',
    priority: 'critical',
    itemsCount: 8,
    totalUnits: 150,
    requestedBy: 'Operator Eleanor Vance',
    createdTime: '10-Oct 11:20 UTC',
    slaDeadline: '10-Oct 20:00 UTC (5h rem)',
    status: 'in-pack',
  },
  {
    id: 'TRF-88188',
    source: 'Newark Cell',
    destination: 'Chicago Base',
    priority: 'standard',
    itemsCount: 22,
    totalUnits: 1100,
    requestedBy: 'System Schedule Matrix',
    createdTime: '10-Oct 09:15 UTC',
    slaDeadline: '12-Oct 12:00 UTC (46h rem)',
    status: 'in-transit',
  },
  {
    id: 'TRF-88185',
    source: 'Chicago Base',
    destination: 'Newark Cell',
    priority: 'standard',
    itemsCount: 30,
    totalUnits: 890,
    requestedBy: 'Operator Marcus Vance',
    createdTime: '09-Oct 22:00 UTC',
    slaDeadline: 'Completed',
    status: 'delivered',
  },
];

export const OrdersScreen: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = ORDERS.filter((ord) => {
    const matchSearch =
      ord.id.toLowerCase().includes(search.toLowerCase()) ||
      ord.source.toLowerCase().includes(search.toLowerCase()) ||
      ord.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || ord.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="nn-screen-content">
      {/* Header */}
      <div className="nn-dashboard-header">
        <div>
          <h1 className="nn-dashboard-title">Orders & Custody Transfers</h1>
          <p className="nn-dashboard-subtitle">
            Inter-node transfer authorizations, pick list execution, and cryptographic handoff verifications.
          </p>
        </div>
        <div className="nn-dashboard-actions">
          <Button variant="secondary" size="small" leftIcon={<ClipboardCheck size={14} />}>
            Generate Pick List
          </Button>
          <Button variant="primary" size="small" leftIcon={<Plus size={14} />}>
            New Transfer Request
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="nn-filter-bar">
        <div className="nn-search-wrap">
          <Input
            placeholder="Search transfer ID or hub..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leadingIcon={<Search size={15} />}
          />
        </div>

        <div className="nn-filter-chips">
          <Chip
            variant="filter"
            selected={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
          >
            All Transfers ({ORDERS.length})
          </Chip>
          <Chip
            variant="filter"
            selected={filterStatus === 'pending-pick'}
            onClick={() => setFilterStatus('pending-pick')}
          >
            Pending Pick (1)
          </Chip>
          <Chip
            variant="filter"
            selected={filterStatus === 'in-pack'}
            onClick={() => setFilterStatus('in-pack')}
          >
            In Packing (1)
          </Chip>
          <Chip
            variant="filter"
            selected={filterStatus === 'in-transit'}
            onClick={() => setFilterStatus('in-transit')}
          >
            In Transit (1)
          </Chip>
          <Chip
            variant="filter"
            selected={filterStatus === 'delivered'}
            onClick={() => setFilterStatus('delivered')}
          >
            Delivered (1)
          </Chip>
        </div>
      </div>

      {/* Orders Table */}
      <section className="nn-nodes-table-wrap" aria-label="Transfer Orders Table">
        <div className="nn-nodes-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardCheck size={16} />
            <h3 className="nn-section-heading">Active Custody Transfer Queue</h3>
          </div>
          <span className="nn-mono-caption">
            Showing {filtered.length} of {ORDERS.length} Orders
          </span>
        </div>

        <div className="nn-table-scroll">
          <table className="nn-nodes-table">
            <thead>
              <tr>
                <th>Transfer ID</th>
                <th>Route</th>
                <th>Priority</th>
                <th>SKUs / Units</th>
                <th>Originator</th>
                <th>SLA Target</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ord) => (
                <tr key={ord.id}>
                  <td className="nn-mono-bold">{ord.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{ord.source}</span>
                      <ArrowRight size={12} style={{ color: 'var(--ts-color-text-tertiary)' }} />
                      <span>{ord.destination}</span>
                    </div>
                  </td>
                  <td>
                    {ord.priority === 'critical' && (
                      <Chip variant="status" tone="error">
                        Critical
                      </Chip>
                    )}
                    {ord.priority === 'high' && (
                      <Chip variant="status" tone="warning">
                        High
                      </Chip>
                    )}
                    {ord.priority === 'standard' && (
                      <Chip variant="status" tone="info">
                        Standard
                      </Chip>
                    )}
                  </td>
                  <td className="nn-mono-text">
                    {ord.itemsCount} SKUs / {ord.totalUnits} Units
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>{ord.requestedBy}</td>
                  <td className="nn-mono-caption">{ord.slaDeadline}</td>
                  <td>
                    {ord.status === 'pending-pick' && (
                      <Chip variant="status" tone="warning">
                        Pending Pick
                      </Chip>
                    )}
                    {ord.status === 'in-pack' && (
                      <Chip variant="status" tone="info">
                        In Packing
                      </Chip>
                    )}
                    {ord.status === 'in-transit' && (
                      <Chip variant="status" tone="info">
                        In Transit
                      </Chip>
                    )}
                    {ord.status === 'delivered' && (
                      <Chip variant="status" tone="success">
                        Delivered
                      </Chip>
                    )}
                  </td>
                  <td>
                    <Button variant="ghost" size="small">
                      Inspect
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
