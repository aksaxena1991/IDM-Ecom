import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from './LineChart';

const meta: Meta<typeof LineChart> = {
  title: 'Data Visualization/LineChart',
  component: LineChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main heading text rendered in Libre Baskerville.',
    },
    subtitle: {
      control: 'text',
      description: 'Secondary caption rendered in Inter body typography.',
    },
    height: {
      control: { type: 'range', min: 180, max: 500, step: 10 },
      description: 'Total chart height in pixels.',
    },
    curve: {
      control: 'inline-radio',
      options: ['linear', 'smooth'],
      description: 'Path curvature interpolation mode.',
    },
    showLegend: {
      control: 'boolean',
      description: 'Whether to display the series legend list.',
    },
    showGrid: {
      control: 'boolean',
      description: 'Whether to display dashed hairline horizontal gridlines.',
    },
    borderless: {
      control: 'boolean',
      description: 'Whether to remove the outer hairline frame and padding.',
    },
    onPointClick: {
      action: 'pointClicked',
      description: 'Action callback fired when clicking a data point node.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LineChart>;

const sampleMonthlyData = [
  { label: 'Jan', visitors: 1200, pageviews: 2400 },
  { label: 'Feb', visitors: 1900, pageviews: 3300 },
  { label: 'Mar', visitors: 1700, pageviews: 3100 },
  { label: 'Apr', visitors: 2400, pageviews: 4500 },
  { label: 'May', visitors: 2800, pageviews: 5200 },
  { label: 'Jun', visitors: 3400, pageviews: 6100 },
  { label: 'Jul', visitors: 3900, pageviews: 7400 },
];

export const Default: Story = {
  args: {
    title: 'Monthly Active Readers',
    subtitle: 'Unique visitors vs page impressions over the last 7 months',
    data: sampleMonthlyData,
    series: [
      { key: 'visitors', label: 'Visitors', color: '#1C1917' },
      { key: 'pageviews', label: 'Pageviews', color: '#78716C' },
    ],
    curve: 'smooth',
    height: 260,
    showLegend: true,
    showGrid: true,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <LineChart {...args} />
    </div>
  ),
};

export const LinearCurve: Story = {
  args: {
    ...Default.args,
    title: 'Linear Trajectory',
    subtitle: 'Sharp angular segment connections',
    curve: 'linear',
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <LineChart {...args} />
    </div>
  ),
};

export const Borderless: Story = {
  args: {
    ...Default.args,
    title: 'Borderless Pure Plane',
    subtitle: 'Frameless presentation for nesting directly inside cards or split panels',
    borderless: true,
  },
  render: (args) => (
    <div style={{ maxWidth: '720px', padding: '16px', background: 'var(--ts-color-bg)' }}>
      <LineChart {...args} />
    </div>
  ),
};
