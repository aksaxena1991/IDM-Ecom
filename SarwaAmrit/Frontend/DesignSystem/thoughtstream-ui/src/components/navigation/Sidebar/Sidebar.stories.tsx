import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar, type SidebarNavGroup } from './Sidebar';
import {
  Sparkles,
  BookOpen,
  Feather,
  Compass,
  Layers,
  Terminal,
  Settings,
  Shield,
  HelpCircle,
  FileCode,
  Folder,
} from 'lucide-react';

const meta: Meta<typeof Sidebar> = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    collapsed: {
      control: 'boolean',
      description: 'Controlled collapsed mode (icon rail)',
    },
    defaultCollapsed: {
      control: 'boolean',
      description: 'Initial collapse state for uncontrolled use',
    },
    collapsible: {
      control: 'boolean',
      description: 'Render the collapse/expand toggle button',
    },
    position: {
      control: 'inline-radio',
      options: ['left', 'right'],
      description: 'Sidebar docking position',
    },
    width: {
      control: { type: 'range', min: 200, max: 360, step: 10 },
      description: 'Width in pixels when expanded',
    },
    collapsedWidth: {
      control: { type: 'range', min: 48, max: 80, step: 4 },
      description: 'Width in pixels when collapsed into icon rail',
    },
    onCollapseChange: { action: 'collapseChanged' },
    onItemClick: { action: 'itemClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const sampleGroups: SidebarNavGroup[] = [
  {
    title: 'Sanctuary',
    items: [
      {
        id: 'overview',
        label: 'Zen Overview',
        icon: <Sparkles size={16} />,
        active: true,
      },
      {
        id: 'manuscripts',
        label: 'Manuscripts',
        icon: <BookOpen size={16} />,
        badge: '18',
        children: [
          { id: 'm-drafts', label: 'Rough Ideations', icon: <FileCode size={14} />, badge: '4' },
          { id: 'm-reviewed', label: 'Contemplated', icon: <Folder size={14} /> },
          { id: 'm-published', label: 'Immutable Release', icon: <Folder size={14} /> },
        ],
      },
      {
        id: 'editor',
        label: 'Distraction-Free Editor',
        icon: <Feather size={16} />,
      },
    ],
  },
  {
    title: 'Taxonomy & Realm',
    items: [
      {
        id: 'explore',
        label: 'Concept Atlas',
        icon: <Compass size={16} />,
      },
      {
        id: 'ontologies',
        label: 'Categorical Trees',
        icon: <Layers size={16} />,
      },
      {
        id: 'terminal',
        label: 'Monospace Shell',
        icon: <Terminal size={16} />,
        badge: 'SH',
      },
    ],
  },
  {
    title: 'Integrity',
    items: [
      {
        id: 'security',
        label: 'Sanctuary Guard',
        icon: <Shield size={16} />,
      },
      {
        id: 'settings',
        label: 'Preferences',
        icon: <Settings size={16} />,
      },
      {
        id: 'manifesto',
        label: 'Zen Manifesto',
        icon: <HelpCircle size={16} />,
      },
    ],
  },
];

/**
 * Standard Left Docked Sidebar (Expandable & Collapsible)
 */
export const Default: Story = {
  args: {
    groups: sampleGroups,
    position: 'left',
    width: 260,
    collapsedWidth: 64,
    collapsible: true,
    defaultCollapsed: false,
    header: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 24, height: 24, background: 'var(--ts-color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ts-color-bg)' }}>
          <Sparkles size={14} />
        </div>
        <span style={{ fontFamily: 'var(--ts-font-heading)', fontWeight: 700, fontSize: '0.9375rem' }}>
          ThoughtStream
        </span>
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', overflow: 'hidden' }}>
        <div style={{ width: 28, height: 28, background: 'var(--ts-color-surface-raised)', border: '1px solid var(--ts-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ts-font-mono)', fontSize: 12, fontWeight: 600 }}>
          TS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            Contemplative Mind
          </span>
          <span style={{ fontFamily: 'var(--ts-font-mono)', fontSize: '0.6875rem', color: 'var(--ts-color-text-tertiary)' }}>
            v0.1.0 • Zen Node
          </span>
        </div>
      </div>
    ),
  },
  render: (args) => {
    const [collapsed, setCollapsed] = useState(args.collapsed ?? false);
    return (
      <div style={{ display: 'flex', height: '560px', width: '100%', border: '1px solid var(--ts-border-subtle)', background: 'var(--ts-color-bg)' }}>
        <Sidebar
          {...args}
          collapsed={collapsed}
          onCollapseChange={(c) => {
            setCollapsed(c);
            args.onCollapseChange?.(c);
          }}
        />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--ts-font-heading)', margin: '0 0 12px 0' }}>
            Workplace Canvas
          </h2>
          <p style={{ color: 'var(--ts-color-text-secondary)', lineHeight: 1.6, maxWidth: 640 }}>
            The sidebar collapses into a compact 64px icon rail with interactive floating tooltips.
            Click the collapse toggle button or expand nested folders in the manuscripts list.
          </p>
        </main>
      </div>
    );
  },
};

/**
 * Collapsed Icon-Rail Mode
 */
export const CollapsedRail: Story = {
  args: {
    ...Default.args,
    defaultCollapsed: true,
  },
  render: (args) => {
    const [collapsed, setCollapsed] = useState(true);
    return (
      <div style={{ display: 'flex', height: '560px', width: '100%', border: '1px solid var(--ts-border-subtle)', background: 'var(--ts-color-bg)' }}>
        <Sidebar
          {...args}
          collapsed={collapsed}
          onCollapseChange={(c) => {
            setCollapsed(c);
            args.onCollapseChange?.(c);
          }}
        />
        <main style={{ flex: 1, padding: 32 }}>
          <h2 style={{ fontFamily: 'var(--ts-font-heading)', margin: '0 0 12px 0' }}>
            Compact Rail Experience
          </h2>
          <p style={{ color: 'var(--ts-color-text-secondary)', lineHeight: 1.6 }}>
            Hover over the icons to inspect the 0px sharp floating tooltips.
          </p>
        </main>
      </div>
    );
  },
};

/**
 * Right-Docked Sidebar
 */
export const RightPositioned: Story = {
  args: {
    ...Default.args,
    position: 'right',
  },
  render: (args) => {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div style={{ display: 'flex', height: '560px', width: '100%', border: '1px solid var(--ts-border-subtle)', background: 'var(--ts-color-bg)' }}>
        <main style={{ flex: 1, padding: 32 }}>
          <h2 style={{ fontFamily: 'var(--ts-font-heading)', margin: '0 0 12px 0' }}>
            Inspector / Context Rail
          </h2>
          <p style={{ color: 'var(--ts-color-text-secondary)', lineHeight: 1.6 }}>
            A right-docked secondary navigation sidebar for tool inspection and properties.
          </p>
        </main>
        <Sidebar
          {...args}
          collapsed={collapsed}
          onCollapseChange={(c) => {
            setCollapsed(c);
            args.onCollapseChange?.(c);
          }}
        />
      </div>
    );
  },
};
