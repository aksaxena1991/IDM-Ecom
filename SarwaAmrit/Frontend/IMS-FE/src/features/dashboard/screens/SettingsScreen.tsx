import React, { useState } from 'react';
import { Card, Chip, Button, Input, Checkbox, useTheme, useToast } from '@thoughtstream/ui';
import {
  Shield,
  Key,
  Globe,
  Sun,
  Moon,
  Copy,
  Check,
  Save,
  RotateCcw,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { toast } = useToast();

  const [clusterId, setClusterId] = useState('CLUSTER-US-EAST-01');
  const [region, setRegion] = useState('us-east-1 (N. Virginia)');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [requireHardwareKey, setRequireHardwareKey] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  const apiKey = 'sk_live_nn_89f02a4e91823bc0914da7f92';

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(apiKey);
    setCopiedKey(true);
    toast.success('API Key Copied', 'Production key copied to clipboard.');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSave = () => {
    toast.success('Configuration Saved', 'System settings updated across distributed nodes.');
  };

  return (
    <div className="nn-screen-content">
      {/* Header */}
      <div className="nn-dashboard-header">
        <div>
          <h1 className="nn-dashboard-title">System Settings & Governance</h1>
          <p className="nn-dashboard-subtitle">
            Cluster topology, single sign-on identity providers, security covenants, and theme preferences.
          </p>
        </div>
        <div className="nn-dashboard-actions">
          <Button variant="secondary" size="small" leftIcon={<RotateCcw size={14} />}>
            Revert
          </Button>
          <Button variant="primary" size="small" leftIcon={<Save size={14} />} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="nn-settings-grid">
        {/* Section 1: Node & Cluster Topology */}
        <Card variant="default" padding="medium" className="nn-settings-card">
          <div className="nn-settings-card-head">
            <Globe size={18} />
            <div>
              <h3 className="nn-settings-card-title">Node & Cluster Topology</h3>
              <p className="nn-settings-card-subtitle">
                Network routing and automated consensus parameters for regional inventory hives.
              </p>
            </div>
          </div>

          <div className="nn-settings-form">
            <Input
              label="Cluster Identifier"
              value={clusterId}
              onChange={(e) => setClusterId(e.target.value)}
              helperText="Assigned by root consensus registry"
            />
            <Input
              label="Primary AWS/Edge Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
            <div className="nn-settings-row">
              <span className="nn-metric-label">Consensus Protocol</span>
              <Chip variant="status" tone="info">
                RAFT-SYNC-v2 (Zero Backpressure)
              </Chip>
            </div>
          </div>
        </Card>

        {/* Section 2: Security & Enterprise SSO */}
        <Card variant="default" padding="medium" className="nn-settings-card">
          <div className="nn-settings-card-head">
            <Shield size={18} />
            <div>
              <h3 className="nn-settings-card-title">Security & SSO Identity Governance</h3>
              <p className="nn-settings-card-subtitle">
                Enterprise federated authentication and cryptographic session enforcement.
              </p>
            </div>
          </div>

          <div className="nn-settings-form">
            <div className="nn-sso-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="nn-mono-bold">Okta Workforce Identity</span>
                <Chip variant="status" tone="success">
                  Connected
                </Chip>
              </div>
              <span className="nn-mono-caption">SAML 2.0 / OIDC • Tenant ID: nector-okta-449</span>
            </div>

            <div className="nn-sso-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="nn-mono-bold">Microsoft Entra ID</span>
                <Chip variant="status" tone="success">
                  Connected
                </Chip>
              </div>
              <span className="nn-mono-caption">Azure AD • Tenant ID: 8812a-nectornest</span>
            </div>

            <Input
              label="Session Inactivity Timeout (minutes)"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              helperText="Automatic lockout threshold for inactive operator consoles"
            />

            <Checkbox
              label="Enforce WebAuthn / FIDO2 Hardware Key for high-value custody transfers"
              checked={requireHardwareKey}
              onChange={(e) => setRequireHardwareKey(e.target.checked)}
            />
          </div>
        </Card>

        {/* Section 3: Display & Design Tokens */}
        <Card variant="default" padding="medium" className="nn-settings-card">
          <div className="nn-settings-card-head">
            <Sun size={18} />
            <div>
              <h3 className="nn-settings-card-title">Design System & Display Aesthetics</h3>
              <p className="nn-settings-card-subtitle">
                Configure Thought-Stream contemplative 0px tokens and color theme.
              </p>
            </div>
          </div>

          <div className="nn-settings-form">
            <div>
              <label className="ts-input-label" style={{ display: 'block', marginBottom: '8px' }}>
                Active Color Theme
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant={resolvedTheme === 'light' ? 'primary' : 'secondary'}
                  size="small"
                  leftIcon={<Sun size={14} />}
                  onClick={() => setTheme('light')}
                >
                  Light Contemplation
                </Button>
                <Button
                  variant={resolvedTheme === 'dark' ? 'primary' : 'secondary'}
                  size="small"
                  leftIcon={<Moon size={14} />}
                  onClick={() => setTheme('dark')}
                >
                  Dark Sanctuary
                </Button>
              </div>
            </div>

            <div className="nn-settings-row">
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Libre Baskerville Display Heading</span>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ts-color-text-secondary)' }}>
                  Enables classic serif typographic rhythm across page titles.
                </p>
              </div>
              <Chip variant="status" tone="success">
                Active
              </Chip>
            </div>

            <div className="nn-settings-row">
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>0px Sharp Architectural Geometry</span>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ts-color-text-secondary)' }}>
                  Strict flat planes with hairline dividers and zero rounded corners.
                </p>
              </div>
              <Chip variant="status" tone="success">
                Enforced
              </Chip>
            </div>
          </div>
        </Card>

        {/* Section 4: API Keys & Edge Webhooks */}
        <Card variant="default" padding="medium" className="nn-settings-card">
          <div className="nn-settings-card-head">
            <Key size={18} />
            <div>
              <h3 className="nn-settings-card-title">API Keys & Edge Webhooks</h3>
              <p className="nn-settings-card-subtitle">
                Cryptographic authentication keys for headless ingestion and warehouse scanners.
              </p>
            </div>
          </div>

          <div className="nn-settings-form">
            <div>
              <label className="ts-input-label" style={{ display: 'block', marginBottom: '6px' }}>
                Production Secret Key
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  value={apiKey}
                  readOnly
                  type="password"
                  containerClassName="nn-api-key-input"
                />
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleCopyKey}
                  leftIcon={copiedKey ? <Check size={14} /> : <Copy size={14} />}
                >
                  {copiedKey ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <Input
              label="Live Webhook Ingestion Endpoint"
              defaultValue="https://mesh.nectornest.io/v1/events/ingest"
              helperText="Receives real-time RFID scans, dock confirmations, and EDI manifests"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
