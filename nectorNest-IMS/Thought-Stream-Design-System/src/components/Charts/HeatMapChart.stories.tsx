import type { Meta, StoryObj } from '@storybook/react';
import { HeatMapChart } from './HeatMapChart';

const meta: Meta<typeof HeatMapChart> = {
  title: 'Data Visualization/HeatMapChart',
  component: HeatMapChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 200, max: 450, step: 10 } },
    borderless: { control: 'boolean' },
    onCellClick: { action: 'cellClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof HeatMapChart>;

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const times = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
const heatmapData: Array<{ x: string; y: string; value: number }> = [];

days.forEach((day, dIdx) => {
  times.forEach((time, tIdx) => {
    const val = Math.floor(Math.sin(dIdx + tIdx) * 40 + 50 + (tIdx === 3 ? 30 : 0));
    heatmapData.push({ x: time, y: day, value: val });
  });
});

export const Default: Story = {
  args: {
    title: 'Writing Cadence Matrix',
    subtitle: '2D intensity grid displaying focused hours across days of the week',
    data: heatmapData,
    xLabels: times,
    yLabels: days,
    height: 280,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '680px' }}>
      <HeatMapChart {...args} />
    </div>
  ),
};
