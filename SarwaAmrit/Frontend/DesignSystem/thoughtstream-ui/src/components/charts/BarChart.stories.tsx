import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from './BarChart';

const meta: Meta<typeof BarChart> = {
  title: 'Data Visualization/BarChart',
  component: BarChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 180, max: 500, step: 10 } },
    showLegend: { control: 'boolean' },
    showGrid: { control: 'boolean' },
    borderless: { control: 'boolean' },
    onBarClick: { action: 'barClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof BarChart>;

const sampleData = [
  { label: 'Jan', visitors: 1200, pageviews: 2400 },
  { label: 'Feb', visitors: 1900, pageviews: 3300 },
  { label: 'Mar', visitors: 1700, pageviews: 3100 },
  { label: 'Apr', visitors: 2400, pageviews: 4500 },
  { label: 'May', visitors: 2800, pageviews: 5200 },
  { label: 'Jun', visitors: 3400, pageviews: 6100 },
];

export const Default: Story = {
  args: {
    title: 'Quarterly Synthesis',
    subtitle: 'Sharp 0px corner rectangular bars grouped by month',
    data: sampleData,
    series: [
      { key: 'visitors', label: 'Direct', color: '#1C1917' },
      { key: 'pageviews', label: 'Referral', color: '#A8A29E' },
    ],
    height: 260,
    showLegend: true,
    showGrid: true,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <BarChart {...args} />
    </div>
  ),
};

export const SingleSeries: Story = {
  args: {
    ...Default.args,
    title: 'Monthly Volume',
    series: [{ key: 'visitors', label: 'Unique Readers', color: '#1C1917' }],
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <BarChart {...args} />
    </div>
  ),
};
