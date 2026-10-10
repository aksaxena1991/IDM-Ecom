import React, { useMemo, useState } from 'react';
import { Button, Card, Chip, Icon, Input, useToast } from '@thoughtstream/ui';

const CATALOG = [
  { sku: 'NN-TEE-001', name: 'Merino Crew Tee', category: 'Apparel', status: 'active' as const, uom: 'EA' },
  { sku: 'NN-BOT-014', name: 'Insulated Bottle 750ml', category: 'Gear', status: 'active' as const, uom: 'EA' },
  { sku: 'NN-BAG-008', name: 'Daypack 22L', category: 'Bags', status: 'draft' as const, uom: 'EA' },
  { sku: 'NN-HAT-003', name: 'Trail Cap', category: 'Apparel', status: 'active' as const, uom: 'EA' },
  { sku: 'NN-KIT-021', name: 'Field Repair Kit', category: 'Accessories', status: 'archived' as const, uom: 'KT' },
];

const STATUS_TONE = {
  active: 'success',
  draft: 'warning',
  archived: 'info',
} as const;

export const CatalogPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter(
      (row) =>
        row.sku.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      <div className="nn-ims-page-header">
        <div>
          <h1>Product catalog</h1>
          <p>Maintain SKU master data for the NectorNest inventory ledger.</p>
        </div>
        <div className="nn-ims-page-actions">
          <Button
            variant="secondary"
            size="small"
            leftIcon={<Icon name="upload" size={14} />}
            onClick={() => toast.info('Import queued', 'CSV catalog import will land in a later iteration.')}
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            size="small"
            leftIcon={<Icon name="add" size={14} />}
            onClick={() => toast.success('SKU draft created', 'Open the editor to finish attributes.')}
          >
            New SKU
          </Button>
        </div>
      </div>

      <section className="nn-ims-metrics" aria-label="Catalog metrics">
        <Card variant="default" padding="medium" className="nn-ims-metric">
          <span className="nn-ims-metric__label">SKUs</span>
          <span className="nn-ims-metric__value">{CATALOG.length}</span>
          <span className="nn-ims-metric__hint">In this demo catalog</span>
        </Card>
        <Card variant="default" padding="medium" className="nn-ims-metric">
          <span className="nn-ims-metric__label">Active</span>
          <span className="nn-ims-metric__value">
            {CATALOG.filter((r) => r.status === 'active').length}
          </span>
          <span className="nn-ims-metric__hint">Sellable / stockable</span>
        </Card>
        <Card variant="default" padding="medium" className="nn-ims-metric">
          <span className="nn-ims-metric__label">Categories</span>
          <span className="nn-ims-metric__value">4</span>
          <span className="nn-ims-metric__hint">Apparel, gear, bags, accessories</span>
        </Card>
      </section>

      <Card variant="default" padding="medium" className="nn-ims-panel">
        <div className="nn-ims-toolbar">
          <Input
            placeholder="Filter by SKU, name, or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leadingIcon={<Icon name="search" size={16} />}
          />
          <Chip variant="status" tone="info">
            {rows.length} shown
          </Chip>
        </div>

        <div className="nn-ims-table-wrap">
          <table className="nn-ims-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>UoM</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="nn-ims-empty">
                    No catalog items match “{query}”.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.sku}>
                    <td className="nn-ims-sku">{row.sku}</td>
                    <td>{row.name}</td>
                    <td>{row.category}</td>
                    <td>{row.uom}</td>
                    <td>
                      <Chip variant="status" tone={STATUS_TONE[row.status]}>
                        {row.status}
                      </Chip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default CatalogPage;
