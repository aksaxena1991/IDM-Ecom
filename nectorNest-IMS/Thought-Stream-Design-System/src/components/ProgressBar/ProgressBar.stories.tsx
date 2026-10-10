import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current progress value',
    },
    min: {
      control: 'number',
      description: 'Minimum scale value',
    },
    max: {
      control: 'number',
      description: 'Maximum scale value',
    },
    buffer: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Secondary buffer preload value',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate continuous gliding state',
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Height thickness tier',
    },
    variant: {
      control: 'select',
      options: ['primary', 'subtle', 'zen', 'success', 'warning', 'error'],
      description: 'Color theme token',
    },
    label: {
      control: 'text',
      description: 'Optional label displayed above progress track',
    },
    showValue: {
      control: 'boolean',
      description: 'Display percentage or step count on right side',
    },
    embeddedValue: {
      control: 'boolean',
      description: 'Embed percentage inside fill (recommended for size="lg")',
    },
    steps: {
      control: { type: 'range', min: 2, max: 8, step: 1 },
      description: 'Total segmented steps count',
    },
    currentStep: {
      control: { type: 'range', min: 1, max: 8, step: 1 },
      description: 'Current active step in segmented mode',
    },
    onClick: { action: 'progressBarClicked' },
    onStepClick: { action: 'stepClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    value: 65,
    min: 0,
    max: 100,
    size: 'sm',
    variant: 'primary',
    label: 'Compiling manuscript',
    showValue: true,
    indeterminate: false,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

export const IndeterminateGliding: Story = {
  args: {
    indeterminate: true,
    label: 'Synchronizing thought stream...',
    size: 'xs',
    variant: 'primary',
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

export const BufferedPlayback: Story = {
  args: {
    value: 45,
    buffer: 75,
    label: 'Audio Contemplation Stream',
    showValue: true,
    size: 'md',
    variant: 'zen',
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

export const LargeWithEmbeddedText: Story = {
  args: {
    value: 78,
    label: 'Volume Index Allocation',
    size: 'lg',
    variant: 'primary',
    embeddedValue: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

export const SteppedProgress: Story = {
  args: {
    steps: 5,
    currentStep: 3,
    label: 'Essay Publication Workflow',
    showValue: true,
    size: 'sm',
    variant: 'primary',
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

export const SizesAndVariantsOverview: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '640px' }}>
      <div>
        <p style={{ fontFamily: 'var(--ts-font-mono)', fontSize: '11px', color: 'var(--ts-color-text-tertiary)', margin: '0 0 10px 0' }}>
          HAIRLINE XS (2PX) - DETERMINATE & INDETERMINATE
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <ProgressBar {...args} value={40} size="xs" label="Index cache" showValue />
          <ProgressBar {...args} indeterminate size="xs" label="Background reconciliation" />
        </div>
      </div>

      <div>
        <p style={{ fontFamily: 'var(--ts-font-mono)', fontSize: '11px', color: 'var(--ts-color-text-tertiary)', margin: '0 0 10px 0' }}>
          SM (4PX) - COLOR VARIANTS
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <ProgressBar {...args} value={72} variant="primary" label="Primary (Stone 900)" showValue />
          <ProgressBar {...args} value={54} variant="zen" label="Zen (Stone 700)" showValue />
          <ProgressBar {...args} value={92} variant="success" label="Optimal Harmony" showValue />
          <ProgressBar {...args} value={38} variant="warning" label="Storage Caution" showValue />
          <ProgressBar {...args} value={15} variant="error" label="Battery Depleted" showValue />
        </div>
      </div>

      <div>
        <p style={{ fontFamily: 'var(--ts-font-mono)', fontSize: '11px', color: 'var(--ts-color-text-tertiary)', margin: '0 0 10px 0' }}>
          STEPPED / SEGMENTED (CLICKABLE STEPS)
        </p>
        <ProgressBar {...args} steps={4} currentStep={2} label="Chapter Synthesis" showValue size="md" />
      </div>
    </div>
  ),
};
