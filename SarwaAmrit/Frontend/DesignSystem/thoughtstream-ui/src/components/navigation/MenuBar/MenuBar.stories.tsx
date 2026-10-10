import type { Meta, StoryObj } from '@storybook/react';
import { MenuBar, type MenuBarItemConfig } from './MenuBar';
import { Button } from '../../actions/Button';
import { Input } from '../../actions/Input';
import {
  FileText,
  Save,
  FolderOpen,
  Share2,
  Trash2,
  Search,
  Sliders,
  Sparkles,
} from 'lucide-react';

const meta: Meta<typeof MenuBar> = {
  title: 'Navigation/MenuBar',
  component: MenuBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Scale sizing of the bar',
    },
    bordered: {
      control: 'boolean',
      description: 'Displays hairline bottom border',
    },
    sticky: {
      control: 'boolean',
      description: 'Sticks to top with subtle backdrop blur',
    },
    onItemClick: { action: 'itemClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof MenuBar>;

const sampleNavItems: MenuBarItemConfig[] = [
  {
    id: 'file',
    label: 'File',
    children: [
      { id: 'new-thought', label: 'New Contemplation', icon: <FileText size={14} />, shortcut: '⌘N' },
      { id: 'open', label: 'Open Manuscript...', icon: <FolderOpen size={14} />, shortcut: '⌘O' },
      { id: 'save', label: 'Save Revision', icon: <Save size={14} />, shortcut: '⌘S' },
      { id: 'share', label: 'Export to Realm', icon: <Share2 size={14} />, dividerAfter: true },
      { id: 'purge', label: 'Purge Buffer', icon: <Trash2 size={14} />, danger: true },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    children: [
      { id: 'undo', label: 'Undo', shortcut: '⌘Z' },
      { id: 'redo', label: 'Redo', shortcut: '⇧⌘Z', dividerAfter: true },
      { id: 'clean-syntax', label: 'Purify Whitespace', shortcut: '⌥⇧F' },
      { id: 'zero-radius', label: 'Enforce 0px Radii', shortcut: '⌘0' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    children: [
      { id: 'zen-mode', label: 'Zen Focus Mode', shortcut: 'F11' },
      { id: 'split-view', label: 'Toggle Split Screen', shortcut: '⌘\\' },
      { id: 'show-metrics', label: 'Telemetry Measure', shortcut: '⌥⌘M' },
    ],
  },
  {
    id: 'archive',
    label: 'Archive',
    badge: '18',
  },
  {
    id: 'docs',
    label: 'Principles',
  },
];

/**
 * Standard Desktop Application MenuBar
 */
export const Default: Story = {
  args: {
    size: 'md',
    bordered: true,
    sticky: false,
    brand: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Sparkles size={16} />
        <span style={{ fontFamily: 'var(--ts-font-heading)', fontWeight: 700 }}>ThoughtStream</span>
      </div>
    ),
    items: sampleNavItems,
    searchSlot: (
      <div style={{ width: 220 }}>
        <Input
          placeholder="Search thoughts... (⌘K)"
          leadingIcon={<Search size={14} />}
        />
      </div>
    ),
    actionsSlot: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button variant="secondary" size="small" leftIcon={<Sliders size={14} />}>
          Settings
        </Button>
        <Button variant="primary" size="small">
          Publish
        </Button>
      </div>
    ),
  },
};

/**
 * Compact Top MenuBar
 */
export const Compact: Story = {
  args: {
    ...Default.args,
    size: 'sm',
  },
};

/**
 * Large Platform Header
 */
export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
  },
};
