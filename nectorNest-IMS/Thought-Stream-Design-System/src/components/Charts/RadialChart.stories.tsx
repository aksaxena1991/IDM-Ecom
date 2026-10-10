import type { Meta, StoryObj } from '@storybook/react';
import { RadialChart } from './RadialChart';

const meta: Meta<typeof RadialChart> = {
  title: 'Data Visualization/RadialChart',
  component: RadialChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 200, max: 450, step: 10 } },
    innerRadius: { control: { type: 'range', min: 20, max: 60, step: 5 } },
    ringWidth: { control: { type: 'range', min: 6, max: 24, step: 2 } },
    ringGap: { control: { type: 'range', min: 2, max: 16, step: 2 } },
    showLegend: { control: 'boolean' },
    borderless: { control: 'boolean' },
    onRingClick: { action: 'ringClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof RadialChart>;

const sampleData = [
  { key: 'mindfulness', label: 'Mindfulness', value: 88, color: '#1C1917' },
  { key: 'writing', label: 'Deep Writing', value: 72, color: '#57534E' },
  { key: 'reading', label: 'Reading', value: 54, color: '#A8A29E' },
  { key: 'rest', label: 'Rest & Silence', value: 92, color: '#D6D3D1' },
];

export const Default: Story = {
  args: {
    title: 'Focus & Energy Allocation',
    subtitle: 'Concentric radial rings with flat 0px stroke endings',
    centerMetric: { value: '88%', label: 'Daily Goal' },
    data: sampleData,
    height: 280,
    innerRadius: 35,
    ringWidth: 14,
    ringGap: 8,
    showLegend: true,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '600px' }}>
      <RadialChart {...args} />
    </div>
  ),
};
