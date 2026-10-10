import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from '../../actions/Button';
import { Feather, Archive } from 'lucide-react';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '60px' }}>
      <Tooltip content="Essays are automatically saved locally as drafts.">
        <Button variant="secondary" leftIcon={<Feather size={16} />}>
          Draft Status
        </Button>
      </Tooltip>
    </div>
  ),
};

export const Placements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', padding: '60px' }}>
      <Tooltip placement="top" content="Top tooltip label">
        <Button variant="secondary" size="small">Top</Button>
      </Tooltip>
      <Tooltip placement="bottom" content="Bottom tooltip label">
        <Button variant="secondary" size="small">Bottom</Button>
      </Tooltip>
      <Tooltip placement="left" content="Left tooltip label">
        <Button variant="secondary" size="small">Left</Button>
      </Tooltip>
      <Tooltip placement="right" content="Right tooltip label">
        <Button variant="secondary" size="small">Right</Button>
      </Tooltip>
    </div>
  ),
};

export const OverIcon: Story = {
  render: () => (
    <div style={{ padding: '60px' }}>
      <Tooltip content="Archived on October 10, 2026. Cannot be edited.">
        <button
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            color: '#78716C',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          aria-label="Archive details"
        >
          <Archive size={20} />
        </button>
      </Tooltip>
    </div>
  ),
};
