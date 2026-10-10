import type { Meta, StoryObj } from '@storybook/react';
import { RangeAreaChart } from './RangeAreaChart';

const meta: Meta<typeof RangeAreaChart> = {
  title: 'Data Visualization/RangeAreaChart',
  component: RangeAreaChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 180, max: 480, step: 10 } },
    showMedian: { control: 'boolean' },
    color: { control: 'color' },
    borderless: { control: 'boolean' },
    onPointClick: { action: 'pointClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof RangeAreaChart>;

const sampleRangeData = [
  { label: '08:00', min: 14, max: 22, median: 18 },
  { label: '10:00', min: 18, max: 28, median: 23 },
  { label: '12:00', min: 22, max: 34, median: 28 },
  { label: '14:00', min: 24, max: 36, median: 30 },
  { label: '16:00', min: 20, max: 32, median: 26 },
  { label: '18:00', min: 16, max: 26, median: 21 },
  { label: '20:00', min: 12, max: 20, median: 16 },
];

export const Default: Story = {
  args: {
    title: 'Ambient Temperature Interval',
    subtitle: 'Upper and lower confidence bounds with central median trajectory',
    data: sampleRangeData,
    height: 260,
    showMedian: true,
    color: '#57534E',
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <RangeAreaChart {...args} />
    </div>
  ),
};
