import type { Meta, StoryObj } from '@storybook/react-vite';
import { List, ListItem } from './List';
import { FileText, ChevronRight, Bookmark, ArrowUpRight } from 'lucide-react';
import { Chip } from '../Chip';

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '560px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof List>;

export const Default: Story = {
  render: () => (
    <List>
      <ListItem
        leading={<FileText size={20} />}
        primaryText="Meditations on the Architectural Page"
        secondaryText="Published Oct 02, 2026 • 8 min read"
        trailing={<ChevronRight size={18} color="#A8A29E" />}
        interactive
      />
      <ListItem
        leading={<FileText size={20} />}
        primaryText="Why Typography Demands Generous Margins"
        secondaryText="Published Sep 24, 2026 • 5 min read"
        trailing={<ChevronRight size={18} color="#A8A29E" />}
        interactive
      />
      <ListItem
        leading={<Bookmark size={20} />}
        primaryText="Curated Readings for Late Autumn"
        secondaryText="Published Sep 12, 2026 • 12 min read"
        trailing={<Chip variant="status" tone="info">Archived</Chip>}
        interactive
      />
    </List>
  ),
};

export const WithInteractiveItems: Story = {
  render: () => (
    <List>
      <ListItem
        leading={<ArrowUpRight size={20} />}
        primaryText="External Letter: The Quiet Aesthetic"
        secondaryText="letters.thoughtstream.org"
        trailing={<span style={{ fontSize: '13px', color: '#78716C' }}>Read</span>}
        interactive
        onClick={() => alert('Navigate to external letter')}
      />
      <ListItem
        leading={<FileText size={20} />}
        primaryText="Design Tokens Specification v1.0"
        secondaryText="tokens/thoughtstream.json"
        trailing={<Chip variant="status" tone="success">Active</Chip>}
        interactive
      />
    </List>
  ),
};
