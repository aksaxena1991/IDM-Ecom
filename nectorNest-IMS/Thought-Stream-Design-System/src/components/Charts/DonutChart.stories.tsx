import type { Meta, StoryObj } from '@storybook/react';
import { DonutChart } from './DonutChart';

const meta: Meta<typeof DonutChart> = {
  title: 'Data Visualization/DonutChart',
  component: DonutChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    size: { control: { type: 'range', min: 180, max: 450, step: 10 } },
    innerRadiusRatio: { control: { type: 'range', min: 0.3, max: 0.85, step: 0.05 } },
    showLegend: { control: 'boolean' },
    borderless: { control: 'boolean' },
    onSliceClick: { action: 'sliceClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof DonutChart>;

const sampleData = [
  { label: 'Drafts & Essays', value: 650, color: '#1C1917' },
  { label: 'Reference Library', value: 420, color: '#57534E' },
  { label: 'Design Tokens & SVGs', value: 230, color: '#78716C' },
  { label: 'Audio Records', value: 100, color: '#D6D3D1' },
];

export const Default: Story = {
  args: {
    title: 'Storage & Archival Composition',
    subtitle: 'Concentric donut ring with central metric readout in Source Code Pro',
    centerMetric: { value: '1.4 TB', label: 'Total Archives' },
    data: sampleData,
    size: 280,
    innerRadiusRatio: 0.65,
    showLegend: true,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '600px' }}>
      <DonutChart {...args} />
    </div>
  ),
};

export const ThinRing: Story = {
  args: {
    ...Default.args,
    innerRadiusRatio: 0.8,
  },
  render: (args) => (
    <div style={{ maxWidth: '600px' }}>
      <DonutChart {...args} />
    </div>
  ),
};
