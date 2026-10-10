import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ThemeProvider,
  useTheme,
  Sidebar,
  type SidebarNavGroup,
  Footer,
  Card,
  Chip,
  Button,
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
  ArrowUpRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const SESSION_KEY = 'nn-base-session';

const DashboardView: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
          onClick: () => setActiveTab('overview'),
        },
        {
          id: 'inventory',
          label: 'Inventory',
          icon: <Package size={16} />,
          active: activeTab === 'inventory',
          badge: '1.2k',
          onClick: () => setActiveTab('inventory'),
        },
        {
          id: 'warehouses',
          label: 'Warehouses',
          icon: <Warehouse size={16} />,
          active: activeTab === 'warehouses',
          onClick: () => setActiveTab('warehouses'),
        },
        {
          id: 'fleet',
          label: 'Fleet & Dispatch',
          icon: <Truck size={16} />,
          active: activeTab === 'fleet',
          onClick: () => setActiveTab('fleet'),
        },
        {
          id: 'orders',
          label: 'Orders & Transfers',
          icon: <ClipboardCheck size={16} />,
          active: activeTab === 'orders',
          badge: '9',
          onClick: () => setActiveTab('orders'),
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
          onClick: () => setActiveTab('analytics'),
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: <Settings size={16} />,
          active: activeTab === 'settings',
          onClick: () => setActiveTab('settings'),
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
              <span>Operations</span>
              <span className="nn-dashboard-breadcrumb-sep">/</span>
              <span className="nn-dashboard-breadcrumb-current">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </span>
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

        {/* Dashboard Main Workspace */}
        <main className="nn-dashboard-main" aria-label="Dashboard content">
          {/* Header Section */}
          <div className="nn-dashboard-header">
            <div>
              <h1 className="nn-dashboard-title">Operations Sanctuary</h1>
              <p className="nn-dashboard-subtitle">
                Distraction-free inventory velocity, node synchronization, and fulfillment ledger.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="small">
                Download Ledger
              </Button>
              <Button variant="primary" size="small">
                Dispatch Order
              </Button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <section className="nn-dashboard-metrics-grid" aria-label="Key Performance Indicators">
            <Card variant="default" padding="medium" className="nn-metric-card">
              <span className="nn-metric-label">Catalog SKUs</span>
              <span className="nn-metric-value">24,580</span>
              <div className="nn-metric-trend nn-metric-trend--positive">
                <ArrowUpRight size={14} />
                <span>+12.4% vs last cycle</span>
              </div>
            </Card>

            <Card variant="default" padding="medium" className="nn-metric-card">
              <span className="nn-metric-label">In-Transit Shipments</span>
              <span className="nn-metric-value">342</span>
              <div className="nn-metric-trend">
                <span>8 active fleet lanes</span>
              </div>
            </Card>

            <Card variant="default" padding="medium" className="nn-metric-card">
              <span className="nn-metric-label">Warehouse Capacity</span>
              <span className="nn-metric-value">78.2%</span>
              <div className="nn-metric-trend">
                <span>Optimal distribution</span>
              </div>
            </Card>

            <Card variant="default" padding="medium" className="nn-metric-card">
              <span className="nn-metric-label">Node Sync Latency</span>
              <span className="nn-metric-value">12ms</span>
              <div className="nn-metric-trend nn-metric-trend--positive">
                <Activity size={14} />
                <span>Zero backpressure</span>
              </div>
            </Card>
          </section>

          {/* Fulfillment Nodes Ledger Section */}
          <section className="nn-nodes-table-wrap" aria-label="Fulfillment Nodes Ledger">
            <div className="nn-nodes-table-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: 'var(--ts-color-success)' }} />
                <h3
                  style={{
                    margin: 0,
                    fontFamily: 'var(--ts-font-heading)',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                  }}
                >
                  Active Fulfillment Cells
                </h3>
              </div>
              <span
                style={{
                  fontFamily: 'var(--ts-font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--ts-color-text-tertiary)',
                }}
              >
                4 Nodes Synchronized
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="nn-nodes-table">
                <thead>
                  <tr>
                    <th>Cell Identifier</th>
                    <th>Facility Region</th>
                    <th>Active Inventory</th>
                    <th>Fleet Lanes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontFamily: 'var(--ts-font-mono)', fontWeight: 600 }}>
                      CELL-NORTH-01
                    </td>
                    <td>Seattle Hub Facility</td>
                    <td style={{ fontFamily: 'var(--ts-font-mono)' }}>8,920 SKUs</td>
                    <td>3 Dedicated</td>
                    <td>
                      <Chip variant="status" tone="success">
                        Synchronized
                      </Chip>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontFamily: 'var(--ts-font-mono)', fontWeight: 600 }}>
                      CELL-CENTRAL-02
                    </td>
                    <td>Chicago Logistics Base</td>
                    <td style={{ fontFamily: 'var(--ts-font-mono)' }}>4,210 SKUs</td>
                    <td>2 Dedicated</td>
                    <td>
                      <Chip variant="status" tone="success">
                        Synchronized
                      </Chip>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontFamily: 'var(--ts-font-mono)', fontWeight: 600 }}>
                      CELL-PACIFIC-03
                    </td>
                    <td>Los Angeles Depot</td>
                    <td style={{ fontFamily: 'var(--ts-font-mono)' }}>7,150 SKUs</td>
                    <td>2 Dedicated</td>
                    <td>
                      <Chip variant="status" tone="success">
                        Synchronized
                      </Chip>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontFamily: 'var(--ts-font-mono)', fontWeight: 600 }}>
                      CELL-EAST-04
                    </td>
                    <td>Newark Distribution Cell</td>
                    <td style={{ fontFamily: 'var(--ts-font-mono)' }}>4,300 SKUs</td>
                    <td>1 Dedicated</td>
                    <td>
                      <Chip variant="status" tone="success">
                        Synchronized
                      </Chip>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
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
