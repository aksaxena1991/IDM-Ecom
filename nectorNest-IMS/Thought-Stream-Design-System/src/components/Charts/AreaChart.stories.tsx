import type { Meta, StoryObj } from '@storybook/react';
import { AreaChart } from './AreaChart';

const meta: Meta<typeof AreaChart> = {
  title: 'Data Visualization/AreaChart',
  component: AreaChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 180, max: 500, step: 10 } },
    curve: { control: 'inline-radio', options: ['linear', 'smooth'] },
    showLegend: { control: 'boolean' },
    showGrid: { control: 'boolean' },
    borderless: { control: 'boolean' },
    onPointClick: { action: 'pointClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof AreaChart>;

const sampleData = [
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
    title: 'Contemplation Velocity',
    subtitle: 'Translucent area gradients with hairline stroke boundaries',
    data: sampleData,
    series: [
      { key: 'pageviews', label: 'Impressions', color: '#57534E', fillOpacity: 0.2 },
      { key: 'visitors', label: 'Direct Readers', color: '#1C1917', fillOpacity: 0.3 },
    ],
    curve: 'smooth',
    height: 260,
    showLegend: true,
    showGrid: true,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <AreaChart {...args} />
    </div>
  ),
};

export const LinearArea: Story = {
  args: {
    ...Default.args,
    title: 'Linear Area Shading',
    curve: 'linear',
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <AreaChart {...args} />
    </div>
  ),
};
