import React from 'react';
import {
  Typography,
  Chip,
  Button,
  useTheme,
} from '@thoughtstream/ui';
import { Sun, Moon, ShieldCheck, Layers, Cpu, Terminal } from 'lucide-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  asideHeadline?: string;
  asideDescription?: string;
  activeTab?: 'login' | 'signup';
  onNavigate?: (path: string) => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  asideHeadline = 'Intelligent Inventory & Multi-Node Nest Architecture',
  asideDescription = 'NectorNest provides distributed inventory operations, telemetry tracing, and automated fulfillment logic across global fulfillment hubs with zero-latency consistency.',
}) => {
  const { toggleTheme, resolvedTheme } = useTheme();

  return (
    <div className="nn-auth-root">
      {/* Top Header Bar */}
      <header className="nn-auth-header">
        <div className="nn-auth-brand">
          <div className="nn-auth-logo-badge">
            <Layers size={18} />
          </div>
          <div className="nn-auth-brand-text">
            <span className="nn-auth-brand-name">NECTORNEST</span>
            <span className="nn-auth-brand-sub">IMS • MICRO-FRONTEND [BASE]</span>
          </div>
        </div>

        <div className="nn-auth-header-actions">
          <Chip
            variant="status"
            tone="info"
            icon={<Cpu size={12} />}
          >
            SYS-ONLINE : CLUSTER-US-EAST
          </Chip>

          <Button
            variant="ghost"
            size="small"
            onClick={toggleTheme}
            aria-label={`Toggle theme (currently ${resolvedTheme})`}
            leftIcon={resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          >
            {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="nn-auth-main">
        {/* Left Column: Editorial & Architecture Identity */}
        <section className="nn-auth-editorial">
          <div className="nn-auth-editorial-content">
            <div className="nn-tagline-wrapper">
              <span className="nn-tagline-pill">CORE IDENTITY PLATFORM</span>
              <span className="nn-tagline-status">
                <span className="nn-pulse-dot" /> LIVE NODES: 42
              </span>
            </div>

            <Typography variant="display" className="nn-editorial-title">
              {asideHeadline}
            </Typography>

            <Typography
              variant="body"
              color="secondary"
              className="nn-editorial-desc"
              measure
            >
              {asideDescription}
            </Typography>

            <div className="nn-architecture-metrics">
              <div className="nn-metric-card">
                <span className="nn-metric-val">99.995%</span>
                <span className="nn-metric-label">UPTIME CONSISTENCY</span>
              </div>
              <div className="nn-metric-card">
                <span className="nn-metric-val">&lt; 1.4ms</span>
                <span className="nn-metric-label">LEDGER SETTLEMENT</span>
              </div>
              <div className="nn-metric-card">
                <span className="nn-metric-val">EAL6+</span>
                <span className="nn-metric-label">SECURITY COMPLIANCE</span>
              </div>
            </div>

            <div className="nn-terminal-preview">
              <div className="nn-terminal-header">
                <div className="nn-terminal-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="nn-terminal-title">
                  <Terminal size={12} style={{ display: 'inline', marginRight: '6px' }} />
                  nn-base :: mfe-runtime@1.0.0
                </span>
              </div>
              <pre className="nn-terminal-body">
{`$ nector-mesh status --tenant=nn-global
[INFO] Module Federation remoteEntry initialized (port 3001)
[AUTH] Thought-Stream-Design-System v0.1.0 tokens mounted
[KEY]  Public key 0x9fA2...3b49 active [ECDSA-secp256k1]`}
              </pre>
            </div>
          </div>

          <footer className="nn-editorial-footer">
            <span className="nn-editorial-copy">
              © {new Date().getFullYear()} NectorNest IMS. Built with Thought-Stream Design System.
            </span>
            <div className="nn-editorial-badges">
              <ShieldCheck size={14} />
              <span>TLS 1.3 Certified Session Protection</span>
            </div>
          </footer>
        </section>

        {/* Right Column: Form Container */}
        <section className="nn-auth-form-container">
          <div className="nn-auth-form-card-wrapper">
            <div className="nn-form-header">
              <Typography variant="headline" className="nn-form-title">
                {title}
              </Typography>
              <Typography variant="bodySmall" color="secondary" className="nn-form-subtitle">
                {subtitle}
              </Typography>
            </div>

            {children}
          </div>
        </section>
      </main>
    </div>
  );
};
