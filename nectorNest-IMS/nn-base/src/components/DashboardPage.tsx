import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ThemeProvider,
  useTheme,
  Sidebar,
  type SidebarNavGroup,
  Footer,
  Chip,
} from '@thoughtstream/ui';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

import { OverviewScreen } from './dashboard/OverviewScreen';
import { InventoryScreen } from './dashboard/InventoryScreen';
import { WarehousesScreen } from './dashboard/WarehousesScreen';
import { FleetScreen } from './dashboard/FleetScreen';
import { OrdersScreen } from './dashboard/OrdersScreen';
import { AnalyticsScreen } from './dashboard/AnalyticsScreen';
import { SettingsScreen } from './dashboard/SettingsScreen';

export const SESSION_KEY = 'nn-base-session';

const VALID_TABS = [
  'overview',
  'inventory',
  'warehouses',
  'fleet',
  'orders',
  'analytics',
  'settings',
] as const;

type DashboardTab = typeof VALID_TABS[number];

const TAB_METADATA: Record<DashboardTab, { group: string; label: string }> = {
  overview: { group: 'Operations', label: 'Overview' },
  inventory: { group: 'Operations', label: 'Inventory' },
  warehouses: { group: 'Operations', label: 'Warehouses' },
  fleet: { group: 'Operations', label: 'Fleet & Dispatch' },
  orders: { group: 'Operations', label: 'Orders & Transfers' },
  analytics: { group: 'Intelligence', label: 'Ledgers & Analytics' },
  settings: { group: 'Intelligence', label: 'System Settings' },
};

const DashboardView: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();

  const currentTab: DashboardTab = (
    tab && (VALID_TABS as readonly string[]).includes(tab) ? tab : 'overview'
  ) as DashboardTab;

  const [activeTab, setActiveTab] = useState<DashboardTab>(currentTab);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (tab && (VALID_TABS as readonly string[]).includes(tab)) {
      setActiveTab(tab as DashboardTab);
    }
  }, [tab]);

  const handleSelectTab = (selectedId: string) => {
    if ((VALID_TABS as readonly string[]).includes(selectedId)) {
      setActiveTab(selectedId as DashboardTab);
      navigate(`/dashboard/${selectedId}`, { replace: true });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    navigate('/login');
  };

  const navGroups: SidebarNavGroup[] = [
    {
      title: 'Operations',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: <LayoutDashboard size={16} />,
          active: activeTab === 'overview',
          badge: 'Live',
          onClick: () => handleSelectTab('overview'),
        },
        {
          id: 'inventory',
          label: 'Inventory',
          icon: <Package size={16} />,
          active: activeTab === 'inventory',
          badge: '1.2k',
          onClick: () => handleSelectTab('inventory'),
        },
        {
          id: 'warehouses',
          label: 'Warehouses',
          icon: <Warehouse size={16} />,
          active: activeTab === 'warehouses',
          onClick: () => handleSelectTab('warehouses'),
        },
        {
          id: 'fleet',
          label: 'Fleet & Dispatch',
          icon: <Truck size={16} />,
          active: activeTab === 'fleet',
          onClick: () => handleSelectTab('fleet'),
        },
        {
          id: 'orders',
          label: 'Orders & Transfers',
          icon: <ClipboardCheck size={16} />,
          active: activeTab === 'orders',
          badge: '9',
          onClick: () => handleSelectTab('orders'),
        },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        {
          id: 'analytics',
          label: 'Ledgers & Analytics',
          icon: <BarChart3 size={16} />,
          active: activeTab === 'analytics',
          onClick: () => handleSelectTab('analytics'),
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: <Settings size={16} />,
          active: activeTab === 'settings',
          onClick: () => handleSelectTab('settings'),
        },
      ],
    },
  ];

  const sidebarHeader = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
      <div
        style={{
          width: 24,
          height: 24,
          backgroundColor: 'var(--ts-color-text-primary)',
          color: 'var(--ts-color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Sparkles size={14} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <span
          style={{
            fontFamily: 'var(--ts-font-heading)',
            fontWeight: 700,
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}
        >
          NectorNest
        </span>
        <span
          style={{
            fontFamily: 'var(--ts-font-mono)',
            fontSize: '0.625rem',
            color: 'var(--ts-color-text-tertiary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          IMS Core
        </span>
      </div>
    </div>
  );

  const collapsedHeader = (
    <div
      title="NectorNest IMS"
      style={{
        width: 24,
        height: 24,
        backgroundColor: 'var(--ts-color-text-primary)',
        color: 'var(--ts-color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Sparkles size={14} />
    </div>
  );

  const sidebarFooter = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', overflow: 'hidden' }}>
      <div
        style={{
          width: 26,
          height: 26,
          backgroundColor: 'var(--ts-color-surface-raised)',
          border: '1px solid var(--ts-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--ts-font-mono)',
          fontSize: 10,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        OP
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          Operator Node
        </span>
        <span
          style={{
            fontFamily: 'var(--ts-font-mono)',
            fontSize: '0.625rem',
            color: 'var(--ts-color-text-tertiary)',
          }}
        >
          v1.0 • active
        </span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="nn-icon-btn"
        title="Sign Out"
        aria-label="Sign out"
      >
        <LogOut size={13} />
      </button>
    </div>
  );

  const collapsedFooter = (
    <button
      type="button"
      onClick={handleLogout}
      className="nn-icon-btn"
      title="Sign Out"
      aria-label="Sign out"
      style={{ width: 28, height: 28 }}
    >
      <LogOut size={14} />
    </button>
  );

  const meta = TAB_METADATA[activeTab] || TAB_METADATA.overview;

  return (
    <div
      className={`nn-dashboard-layout thoughtstream-theme-${resolvedTheme}`}
      data-theme={resolvedTheme}
    >
      {/* Compact Sidebar at Left from @thoughtstream/ui */}
      <div className="nn-dashboard-sidebar-wrap">
        <Sidebar
          position="left"
          compact
          collapsed={collapsed}
          onCollapseChange={setCollapsed}
          collapsible={true}
          collapsedWidth={64}
          width={240}
          header={sidebarHeader}
          collapsedHeader={collapsedHeader}
          footer={sidebarFooter}
          collapsedFooter={collapsedFooter}
          groups={navGroups}
        />
      </div>

      {/* Main Viewport & Content Area */}
      <div className="nn-dashboard-viewport">
        {/* Minimal Topbar */}
        <header className="nn-dashboard-topbar">
          <div className="nn-dashboard-topbar-left">
            <nav className="nn-dashboard-breadcrumb" aria-label="Breadcrumb">
              <span>{meta.group}</span>
              <span className="nn-dashboard-breadcrumb-sep">/</span>
              <span className="nn-dashboard-breadcrumb-current">{meta.label}</span>
            </nav>
          </div>

          <div className="nn-dashboard-topbar-right">
            <Chip variant="status" tone="success">
              Live Node
            </Chip>
            <button
              type="button"
              className="nn-icon-btn"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} theme`}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </div>
        </header>

        {/* Dashboard Main Workspace - Renders the active screen */}
        <main className="nn-dashboard-main" aria-label="Dashboard content">
          {activeTab === 'overview' && <OverviewScreen onNavigateToTab={handleSelectTab} />}
          {activeTab === 'inventory' && <InventoryScreen />}
          {activeTab === 'warehouses' && <WarehousesScreen />}
          {activeTab === 'fleet' && <FleetScreen />}
          {activeTab === 'orders' && <OrdersScreen />}
          {activeTab === 'analytics' && <AnalyticsScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </main>

        {/* Minimal Footer from @thoughtstream/ui */}
        <Footer
          variant="minimal"
          className="nn-dashboard-footer"
          brand={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} />
              <span>NectorNest IMS</span>
            </div>
          }
          status={{
            label: 'All fulfillment nodes active & synchronized',
            state: 'operational',
          }}
          copyright={`© ${new Date().getFullYear()} NectorNest IMS. Distraction-free operations.`}
          legalLinks={[
            { label: 'Operations Ledger', href: '#ledger' },
            { label: 'Telemetry & Security', href: '#telemetry' },
            { label: 'Zen Manifesto', href: '#manifesto' },
          ]}
          showBackToTop={true}
        />
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  if (!sessionStorage.getItem(SESSION_KEY)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="nectornest-theme">
      <DashboardView />
    </ThemeProvider>
  );
};
