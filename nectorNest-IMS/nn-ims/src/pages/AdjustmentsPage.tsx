import React from 'react';
import { Button, Card, Chip, Icon, useToast } from '@thoughtstream/ui';

const ADJUSTMENTS = [
  {
    id: 'ADJ-901',
    sku: 'NN-BOT-014',
    reason: 'Cycle count variance',
    delta: -4,
    by: 'ops.maya',
    when: '2h ago',
  },
  {
    id: 'ADJ-902',
    sku: 'NN-TEE-001',
    reason: 'Damaged in bin',
    delta: -2,
    by: 'ops.leo',
    when: 'Yesterday',
  },
  {
    id: 'ADJ-903',
    sku: 'NN-HAT-003',
    reason: 'Found stock',
    delta: 6,
    by: 'ops.maya',
    when: '3d ago',
  },
];

export const AdjustmentsPage: React.FC = () => {
  const { toast } = useToast();

  return (
    <>
      <div className="nn-ims-page-header">
        <div>
          <h1>Inventory adjustments</h1>
          <p>Controlled quantity corrections with reason codes for auditability.</p>
        </div>
        <div className="nn-ims-page-actions">
          <Button
            variant="primary"
            size="small"
            leftIcon={<Icon name="edit_note" size={14} />}
            onClick={() =>
              toast.success('Adjustment started', 'Select SKU, location, and reason code.')
            }
          >
            New adjustment
          </Button>
        </div>
      </div>

      <section className="nn-ims-metrics" aria-label="Adjustment metrics">
        <Card variant="default" padding="medium" className="nn-ims-metric">
          <span className="nn-ims-metric__label">This week</span>
          <span className="nn-ims-metric__value">{ADJUSTMENTS.length}</span>
          <span className="nn-ims-metric__hint">Posted adjustment documents</span>
        </Card>
        <Card variant="default" padding="medium" className="nn-ims-metric">
          <span className="nn-ims-metric__label">Net delta</span>
          <span className="nn-ims-metric__value">
            {ADJUSTMENTS.reduce((sum, row) => sum + row.delta, 0)}
          </span>
          <span className="nn-ims-metric__hint">Units across open history</span>
        </Card>
      </section>

      <Card variant="default" padding="medium" className="nn-ims-panel">
        <div className="nn-ims-table-wrap">
          <table className="nn-ims-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>SKU</th>
                <th>Reason</th>
                <th>Delta</th>
                <th>Operator</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {ADJUSTMENTS.map((row) => (
                <tr key={row.id}>
                  <td className="nn-ims-sku">{row.id}</td>
                  <td className="nn-ims-sku">{row.sku}</td>
                  <td>{row.reason}</td>
                  <td>
                    <Chip variant="status" tone={row.delta < 0 ? 'error' : 'success'}>
                      {row.delta > 0 ? `+${row.delta}` : row.delta}
                    </Chip>
                  </td>
                  <td>{row.by}</td>
                  <td>{row.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default AdjustmentsPage;
