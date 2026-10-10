import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CollapsibleMenuBar, type MenuBarItemConfig } from './MenuBar';
import { Button } from '../Button';
import { Input } from '../Input';
import { Sparkles, Search, Compass, BookOpen, Layers, Terminal, Sliders } from 'lucide-react';

const meta: Meta<typeof CollapsibleMenuBar> = {
  title: 'Navigation/CollapsibleMenuBar',
  component: CollapsibleMenuBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    collapsed: {
      control: 'boolean',
      description: 'Controlled collapsed state',
    },
    defaultCollapsed: {
      control: 'boolean',
      description: 'Default collapsed state for uncontrolled use',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Scale sizing of the bar',
    },
    bordered: {
      control: 'boolean',
      description: 'Displays hairline bottom border',
    },
    onCollapseChange: { action: 'collapseChanged' },
    onItemClick: { action: 'itemClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof CollapsibleMenuBar>;

const sampleResponsiveItems: MenuBarItemConfig[] = [
  {
    id: 'explore',
    label: 'Explore Catalog',
    icon: <Compass size={16} />,
  },
  {
    id: 'manuscripts',
    label: 'Manuscripts & Codex',
    icon: <BookOpen size={16} />,
    badge: '12',
    children: [
      { id: 'ch1', label: 'Chapter I: The Flat Plane', shortcut: '01' },
      { id: 'ch2', label: 'Chapter II: The 0px Threshold', shortcut: '02' },
      { id: 'ch3', label: 'Chapter III: Contemplative Measure', shortcut: '03' },
    ],
  },
  {
    id: 'taxonomy',
    label: 'Taxonomy Trees',
    icon: <Layers size={16} />,
  },
  {
    id: 'telemetry',
    label: 'System Telemetry',
    icon: <Terminal size={16} />,
  },
];

/**
 * Default Collapsible MenuBar (starts collapsed)
 */
export const Default: Story = {
  args: {
    defaultCollapsed: true,
    size: 'md',
    bordered: true,
    brand: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Sparkles size={16} />
        <span style={{ fontFamily: 'var(--ts-font-heading)', fontWeight: 700 }}>ThoughtStream</span>
      </div>
    ),
    items: sampleResponsiveItems,
    searchSlot: (
      <Input
        placeholder="Filter manuscripts & indexes..."
        leadingIcon={<Search size={14} />}
      />
    ),
    actionsSlot: (
      <Button variant="secondary" size="small" leftIcon={<Sliders size={14} />}>
        Settings
      </Button>
    ),
  },
  render: (args) => {
    const [collapsed, setCollapsed] = useState(args.collapsed ?? true);
    return (
      <div style={{ width: '100%', minHeight: 380, background: 'var(--ts-color-bg)' }}>
        <CollapsibleMenuBar
          {...args}
          collapsed={collapsed}
          onCollapseChange={(c) => {
            setCollapsed(c);
            args.onCollapseChange?.(c);
          }}
        />
        <div style={{ padding: 32, maxWidth: 640 }}>
          <h2 style={{ fontFamily: 'var(--ts-font-heading)', margin: '0 0 12px 0' }}>
            Responsive Collapsible Bar
          </h2>
          <p style={{ color: 'var(--ts-color-text-secondary)', lineHeight: 1.6 }}>
            Click the sharp 0px toggle button in the top right to fold and unfold the full navigation
            tray, search input, and sub-items.
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Expanded by Default
 */
export const Expanded: Story = {
  args: {
    ...Default.args,
    defaultCollapsed: false,
  },
  render: (args) => {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div style={{ width: '100%', minHeight: 450, background: 'var(--ts-color-bg)' }}>
        <CollapsibleMenuBar
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
