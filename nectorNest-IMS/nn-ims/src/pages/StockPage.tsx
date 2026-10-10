import React, { useMemo, useState } from 'react';
import { Button, Card, Chip, Icon, Input, ProgressBar, useToast } from '@thoughtstream/ui';

const STOCK = [
  { sku: 'NN-TEE-001', location: 'WH-NORTH / A-12', onHand: 420, reserved: 48, reorder: 120 },
  { sku: 'NN-BOT-014', location: 'WH-NORTH / B-03', onHand: 86, reserved: 12, reorder: 100 },
  { sku: 'NN-HAT-003', location: 'WH-SOUTH / C-01', onHand: 240, reserved: 0, reorder: 80 },
  { sku: 'NN-BAG-008', location: 'WH-SOUTH / D-18', onHand: 18, reserved: 6, reorder: 40 },
];

export const StockPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STOCK;
    return STOCK.filter(
      (row) => row.sku.toLowerCase().includes(q) || row.location.toLowerCase().includes(q)
    );
  }, [query]);

  const availableTotal = STOCK.reduce((sum, row) => sum + (row.onHand - row.reserved), 0);
  const lowCount = STOCK.filter((row) => row.onHand - row.reserved < row.reorder).length;

  return (
    <>
      <div className="nn-ims-page-header">
        <div>
          <h1>On-hand stock</h1>
          <p>Location-level availability with reserved quantity and reorder thresholds.</p>
        </div>
        <div className="nn-ims-page-actions">
          <Button
            variant="secondary"
            size="small"
            leftIcon={<Icon name="download" size={14} />}
            onClick={() => toast.info('Export started', 'Stock snapshot CSV is being prepared.')}
          >
            Export
          </Button>
          <Button
            variant="primary"
            size="small"
            leftIcon={<Icon name="move_down" size={14} />}
            onClick={() => toast.success('Transfer drafted', 'Create source and destination bins next.')}
          >
            Transfer
          </Button>
        </div>
      </div>

      <section className="nn-ims-metrics" aria-label="Stock metrics">
        <Card variant="default" padding="medium" className="nn-ims-metric">
          <span className="nn-ims-metric__label">Available</span>
          <span className="nn-ims-metric__value">{availableTotal.toLocaleString()}</span>
          <span className="nn-ims-metric__hint">Units free to allocate</span>
        </Card>
        <Card variant="default" padding="medium" className="nn-ims-metric">
          <span className="nn-ims-metric__label">Below reorder</span>
          <span className="nn-ims-metric__value">{lowCount}</span>
          <span className="nn-ims-metric__hint">Locations needing replenishment</span>
        </Card>
      </section>

      <Card variant="default" padding="medium" className="nn-ims-panel">
        <div className="nn-ims-toolbar">
          <Input
            placeholder="Filter by SKU or location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leadingIcon={<Icon name="search" size={16} />}
          />
        </div>

        <div className="nn-ims-table-wrap">
          <table className="nn-ims-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Location</th>
                <th>On hand</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Fill vs reorder</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const available = row.onHand - row.reserved;
                const fill = Math.min(100, Math.round((available / row.reorder) * 100));
                const low = available < row.reorder;
                return (
                  <tr key={`${row.sku}-${row.location}`}>
                    <td className="nn-ims-sku">{row.sku}</td>
                    <td>{row.location}</td>
                    <td>{row.onHand}</td>
                    <td>{row.reserved}</td>
                    <td>
                      <Chip variant="status" tone={low ? 'warning' : 'success'}>
                        {available}
                      </Chip>
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <ProgressBar value={fill} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default StockPage;
