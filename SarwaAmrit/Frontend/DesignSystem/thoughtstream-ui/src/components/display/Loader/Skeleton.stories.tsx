import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'rectangular', 'avatar', 'card'],
      description: 'Skeleton layout shape archetype',
    },
    count: {
      control: { type: 'range', min: 1, max: 8, step: 1 },
      description: 'Number of units to stack (for text / shapes)',
    },
    shimmer: {
      control: 'boolean',
      description: 'Enables gentle linear light shimmer animation',
    },
    circle: {
      control: 'boolean',
      description: 'Border radius circle override (Avatar exception only)',
    },
    width: {
      control: 'text',
      description: 'Custom width in px or percentage string',
    },
    height: {
      control: 'text',
      description: 'Custom height in px or percentage string',
    },
    onClick: { action: 'skeletonClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const DefaultText: Story = {
  args: {
    variant: 'text',
    count: 3,
    shimmer: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <Skeleton {...args} />
    </div>
  ),
};

export const CardPlaceholder: Story = {
  args: {
    variant: 'card',
    shimmer: true,
    circle: false,
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Skeleton {...args} />
    </div>
  ),
};

export const AvatarPlaceholder: Story = {
  args: {
    variant: 'avatar',
    circle: true,
    shimmer: true,
    width: 44,
    height: 44,
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Skeleton {...args} />
      <Skeleton {...args} circle={false} />
    </div>
  ),
};

export const RectangularBlock: Story = {
  args: {
    variant: 'rectangular',
    width: '100%',
    height: 160,
    shimmer: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <Skeleton {...args} />
    </div>
  ),
};

export const ShimmerOff: Story = {
  args: {
    variant: 'card',
    shimmer: false,
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Skeleton {...args} />
    </div>
  ),
};
