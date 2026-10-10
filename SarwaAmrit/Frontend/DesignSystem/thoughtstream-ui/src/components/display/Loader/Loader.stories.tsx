import type { Meta, StoryObj } from '@storybook/react';
import { Loader } from './Loader';

const meta: Meta<typeof Loader> = {
  title: 'Feedback/Loader',
  component: Loader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['spinner', 'dots', 'line', 'pulse', 'zen'],
      description: 'Visual animation variant',
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Scale size tier',
    },
    color: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'subtle', 'white'],
      description: 'Color theme token',
    },
    label: {
      control: 'text',
      description: 'Accompanying text label',
    },
    labelPosition: {
      control: 'inline-radio',
      options: ['right', 'bottom'],
      description: 'Placement of the label relative to the indicator',
    },
    centered: {
      control: 'boolean',
      description: 'Center within parent container',
    },
    fullscreen: {
      control: 'boolean',
      description: 'Render inside full-screen backdrop overlay',
    },
    onClick: { action: 'loaderClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  args: {
    variant: 'spinner',
    size: 'md',
    color: 'primary',
    label: 'Restoring state...',
    labelPosition: 'right',
    centered: false,
    fullscreen: false,
  },
  render: (args) => <Loader {...args} />,
};

export const MonospaceDots: Story = {
  args: {
    variant: 'dots',
    size: 'md',
    color: 'primary',
    label: 'Thinking...',
    labelPosition: 'right',
  },
  render: (args) => <Loader {...args} />,
};

export const ScanningLine: Story = {
  args: {
    variant: 'line',
    size: 'md',
    color: 'primary',
    label: 'Indexing stream...',
    labelPosition: 'right',
  },
  render: (args) => <Loader {...args} />,
};

export const BreathingPulse: Story = {
  args: {
    variant: 'pulse',
    size: 'md',
    color: 'primary',
    label: 'Calibrating...',
    labelPosition: 'right',
  },
  render: (args) => <Loader {...args} />,
};

export const ZenMonogram: Story = {
  args: {
    variant: 'zen',
    size: 'lg',
    color: 'primary',
    label: 'Contemplation active',
    labelPosition: 'bottom',
  },
  render: (args) => <Loader {...args} />,
};

export const SizeTiersOverview: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <p style={{ fontFamily: 'var(--ts-font-mono)', fontSize: '11px', color: 'var(--ts-color-text-tertiary)', margin: 0 }}>
        SIZE TIERS (XS to XL)
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Loader {...args} size="xs" label="xs" />
        <Loader {...args} size="sm" label="sm" />
        <Loader {...args} size="md" label="md" />
        <Loader {...args} size="lg" label="lg" />
        <Loader {...args} size="xl" label="xl" />
      </div>
    </div>
  ),
};

export const AllVariantsOverview: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', maxWidth: '780px' }}>
      <div style={{ padding: '20px', border: '1px solid var(--ts-border-subtle)', background: 'var(--ts-color-bg)' }}>
        <Loader {...args} variant="spinner" label="Spinner" />
      </div>
      <div style={{ padding: '20px', border: '1px solid var(--ts-border-subtle)', background: 'var(--ts-color-bg)' }}>
        <Loader {...args} variant="dots" label="Rhythm Dots" />
      </div>
      <div style={{ padding: '20px', border: '1px solid var(--ts-border-subtle)', background: 'var(--ts-color-bg)' }}>
        <Loader {...args} variant="line" label="Scanning Line" />
      </div>
      <div style={{ padding: '20px', border: '1px solid var(--ts-border-subtle)', background: 'var(--ts-color-bg)' }}>
        <Loader {...args} variant="pulse" label="Breathing Box" />
      </div>
      <div style={{ padding: '20px', border: '1px solid var(--ts-border-subtle)', background: 'var(--ts-color-bg)' }}>
        <Loader {...args} variant="zen" label="Zen Monogram" />
      </div>
    </div>
  ),
};
