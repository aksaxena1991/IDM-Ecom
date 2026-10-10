import type { Meta, StoryObj } from '@storybook/react';
import { GaugeChart } from './GaugeChart';

const meta: Meta<typeof GaugeChart> = {
  title: 'Data Visualization/GaugeChart',
  component: GaugeChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    min: { control: 'number' },
    max: { control: 'number' },
    unit: { control: 'text' },
    size: { control: { type: 'range', min: 200, max: 450, step: 10 } },
    borderless: { control: 'boolean' },
    onGaugeClick: { action: 'gaugeClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof GaugeChart>;

export const Default: Story = {
  args: {
    title: 'System Focus Index',
    subtitle: 'Semicircular dial gauge with threshold zones and hairline needle',
    value: 78,
    min: 0,
    max: 100,
    unit: 'pts',
    size: 280,
    zones: [
      { label: 'Distracted', from: 0, to: 40, color: '#D6D3D1' },
      { label: 'Attentive', from: 40, to: 70, color: '#78716C' },
      { label: 'Deep Zen', from: 70, to: 100, color: '#1C1917' },
    ],
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '520px' }}>
      <GaugeChart {...args} />
    </div>
  ),
};

export const CriticalThreshold: Story = {
  args: {
    ...Default.args,
    value: 28,
    title: 'Attention Drift Warning',
  },
  render: (args) => (
    <div style={{ maxWidth: '520px' }}>
      <GaugeChart {...args} />
    </div>
  ),
};
