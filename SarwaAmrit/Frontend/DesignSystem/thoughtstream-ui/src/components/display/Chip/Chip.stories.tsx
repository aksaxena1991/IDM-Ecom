import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';
import { Check, Bookmark, Sparkles } from 'lucide-react';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const FilterChips: Story = {
  render: () => {
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const tags = ['all', 'philosophy', 'typography', 'architecture', 'slow-living'];

    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            variant="filter"
            selected={selectedTag === tag}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </Chip>
        ))}
      </div>
    );
  },
};

export const StatusChips: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Chip variant="status" tone="success">
        Published
      </Chip>
      <Chip variant="status" tone="warning">
        In Review
      </Chip>
      <Chip variant="status" tone="error">
        Draft Retracted
      </Chip>
      <Chip variant="status" tone="info">
        Archived
      </Chip>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Chip variant="filter" icon={<Bookmark size={13} />}>
        Saved
      </Chip>
      <Chip variant="filter" selected icon={<Check size={13} />}>
        Selected
      </Chip>
      <Chip variant="status" tone="success" icon={<Sparkles size={12} />}>
        Verified
      </Chip>
    </div>
  ),
};
