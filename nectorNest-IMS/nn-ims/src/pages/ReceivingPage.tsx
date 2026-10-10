import React from 'react';
import { Button, Card, Chip, Icon, useToast } from '@thoughtstream/ui';

const RECEIPTS = [
  {
    id: 'ASN-24018',
    supplier: 'Alpine Mills Co.',
    eta: 'Today · 14:30',
    lines: 12,
    status: 'docked' as const,
  },
  {
    id: 'ASN-24021',
    supplier: 'Northline Plastics',
    eta: 'Tomorrow · 09:00',
    status: 'in_transit' as const,
    lines: 6,
  },
  {
    id: 'ASN-24009',
    supplier: 'Trailform Textiles',
    eta: 'Yesterday',
    status: 'putaway' as const,
    lines: 18,
  },
];

const TONE = {
  docked: 'warning',
  in_transit: 'info',
  putaway: 'success',
} as const;

export const ReceivingPage: React.FC = () => {
  const { toast } = useToast();

  return (
    <>
      <div className="nn-ims-page-header">
        <div>
          <h1>Receiving</h1>
          <p>Advance shipping notices, dock appointments, and putaway readiness.</p>
        </div>
        <div className="nn-ims-page-actions">
          <Button
            variant="primary"
            size="small"
            leftIcon={<Icon name="qr_code_scanner" size={14} />}
            onClick={() => toast.info('Scanner ready', 'Point the handheld at the ASN barcode.')}
          >
            Scan ASN
          </Button>
        </div>
      </div>

      <section className="nn-ims-metrics" aria-label="Receiving metrics">
        <Card variant="default" padding="medium" className="nn-ims-metric">
          <span className="nn-ims-metric__label">Open ASNs</span>
          <span className="nn-ims-metric__value">
            {RECEIPTS.filter((r) => r.status !== 'putaway').length}
          </span>
          <span className="nn-ims-metric__hint">Awaiting full putaway</span>
        </Card>
        <Card variant="default" padding="medium" className="nn-ims-metric">
          <span className="nn-ims-metric__label">Lines today</span>
          <span className="nn-ims-metric__value">36</span>
          <span className="nn-ims-metric__hint">Expected inbound detail lines</span>
        </Card>
      </section>

      <Card variant="default" padding="medium" className="nn-ims-panel">
        <div className="nn-ims-table-wrap">
          <table className="nn-ims-table">
            <thead>
              <tr>
                <th>ASN</th>
                <th>Supplier</th>
                <th>ETA</th>
                <th>Lines</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {RECEIPTS.map((row) => (
                <tr key={row.id}>
                  <td className="nn-ims-sku">{row.id}</td>
                  <td>{row.supplier}</td>
                  <td>{row.eta}</td>
                  <td>{row.lines}</td>
                  <td>
                    <Chip variant="status" tone={TONE[row.status]}>
                      {row.status.replace('_', ' ')}
                    </Chip>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="small"
                      leftIcon={<Icon name="visibility" size={14} />}
                      onClick={() => toast.info(row.id, `${row.supplier} · ${row.lines} lines`)}
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default ReceivingPage;
