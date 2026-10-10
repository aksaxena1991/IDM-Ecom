import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Chip,
  Footer,
  Icon,
  Sidebar,
  useTheme,
  useToast,
  type SidebarNavGroup,
} from '@thoughtstream/ui';
import { AdjustmentsPage } from './AdjustmentsPage';
import { CatalogPage } from './CatalogPage';
import { ReceivingPage } from './ReceivingPage';
import { StockPage } from './StockPage';

export const IMS_TABS = ['catalog', 'stock', 'receiving', 'adjustments'] as const;
export type ImsTab = (typeof IMS_TABS)[number];

const TAB_META: Record<ImsTab, { group: string; label: string; eyebrow: string }> = {
  catalog: { group: 'Master data', label: 'Product catalog', eyebrow: 'SKU master' },
  stock: { group: 'Operations', label: 'On-hand stock', eyebrow: 'Availability' },
  receiving: { group: 'Operations', label: 'Receiving', eyebrow: 'Inbound' },
  adjustments: { group: 'Controls', label: 'Adjustments', eyebrow: 'Cycle count' },
};

function isImsTab(value: string | undefined): value is ImsTab {
  return !!value && (IMS_TABS as readonly string[]).includes(value);
}

export const ImsShell: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  const activeTab: ImsTab = isImsTab(tab) ? tab : 'catalog';

  useEffect(() => {
    if (!isImsTab(tab)) {
      navigate('/ims/catalog', { replace: true });
    }
  }, [tab, navigate]);

  const navGroups: SidebarNavGroup[] = useMemo(
    () => [
      {
        title: 'Master data',
        items: [
          {
            id: 'catalog',
            label: 'Catalog',
            icon: <Icon name="inventory_2" size={16} />,
            active: activeTab === 'catalog',
            onClick: () => navigate('/ims/catalog', { replace: true }),
          },
        ],
      },
      {
        title: 'Operations',
        items: [
          {
            id: 'stock',
            label: 'Stock',
            icon: <Icon name="package_2" size={16} />,
            active: activeTab === 'stock',
            badge: 'Live',
            onClick: () => navigate('/ims/stock', { replace: true }),
          },
          {
            id: 'receiving',
            label: 'Receiving',
            icon: <Icon name="local_shipping" size={16} />,
            active: activeTab === 'receiving',
            onClick: () => navigate('/ims/receiving', { replace: true }),
          },
        ],
      },
      {
        title: 'Controls',
        items: [
          {
            id: 'adjustments',
            label: 'Adjustments',
            icon: <Icon name="tune" size={16} />,
            active: activeTab === 'adjustments',
            onClick: () => navigate('/ims/adjustments', { replace: true }),
          },
        ],
      },
    ],
    [activeTab, navigate]
  );

  const meta = TAB_META[activeTab];

  const sidebarHeader = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <div
        style={{
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--ts-color-text-primary)',
          color: 'var(--ts-color-bg)',
          flexShrink: 0,
        }}
      >
        <Icon name="inventory" size={16} />
      </div>
      {!collapsed && (
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>NectorNest</div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ts-color-text-secondary)',
              fontFamily: 'var(--ts-font-mono)',
            }}
          >
            nn-ims
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`nn-ims-shell thoughtstream-theme-${resolvedTheme}`} data-theme={resolvedTheme}>
      <Sidebar
        position="left"
        compact
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
        collapsible
        width={240}
        collapsedWidth={64}
        header={sidebarHeader}
        collapsedHeader={
          <div
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--ts-color-text-primary)',
              color: 'var(--ts-color-bg)',
            }}
          >
            <Icon name="inventory" size={16} />
          </div>
        }
        groups={navGroups}
        footer={
          <Button
            variant="ghost"
            size="small"
            fullWidth
            leftIcon={
              <Icon name={resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'} size={16} />
            }
            onClick={toggleTheme}
          >
            {collapsed ? '' : resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
          </Button>
        }
      />

      <div className="nn-ims-main">
        <header className="nn-ims-topbar">
          <div className="nn-ims-topbar__meta">
            <span className="nn-ims-topbar__eyebrow">
              {meta.group} · {meta.eyebrow}
            </span>
            <h1 className="nn-ims-topbar__title">{meta.label}</h1>
          </div>
          <div className="nn-ims-topbar__actions">
            <Chip variant="status" tone="info">
              Module federation · :3002
            </Chip>
            <Button
              variant="secondary"
              size="small"
              leftIcon={<Icon name="sync" size={14} />}
              onClick={() =>
                toast.success('Ledger synced', 'Inventory snapshots refreshed from the last cycle.')
              }
            >
              Sync ledger
            </Button>
          </div>
        </header>

        <main className="nn-ims-content">
          {activeTab === 'catalog' && <CatalogPage />}
          {activeTab === 'stock' && <StockPage />}
          {activeTab === 'receiving' && <ReceivingPage />}
          {activeTab === 'adjustments' && <AdjustmentsPage />}
        </main>

        <div className="nn-ims-footer">
          <Footer
            variant="minimal"
            brand={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon name="inventory_2" size={14} />
                NectorNest IMS
              </span>
            }
            quote="Inventory micro-frontend powered by ThoughtStream UI"
            copyright={`© ${new Date().getFullYear()} NectorNest · nn-ims`}
            showBackToTop={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ImsShell;
