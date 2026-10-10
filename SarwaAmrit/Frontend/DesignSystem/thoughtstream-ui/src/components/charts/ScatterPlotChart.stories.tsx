import type { Meta, StoryObj } from '@storybook/react';
import { ScatterPlotChart } from './ScatterPlotChart';

const meta: Meta<typeof ScatterPlotChart> = {
  title: 'Data Visualization/ScatterPlotChart',
  component: ScatterPlotChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    xLabel: { control: 'text' },
    yLabel: { control: 'text' },
    height: { control: { type: 'range', min: 200, max: 480, step: 10 } },
    showTrendline: { control: 'boolean' },
    borderless: { control: 'boolean' },
    onPointClick: { action: 'pointClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ScatterPlotChart>;

const points = [
  { x: 12, y: 35, label: 'Entry 1', category: 'Phase A' },
  { x: 22, y: 55, label: 'Entry 2', category: 'Phase A' },
  { x: 28, y: 48, label: 'Entry 3', category: 'Phase A' },
  { x: 38, y: 68, label: 'Entry 4', category: 'Phase B' },
  { x: 44, y: 72, label: 'Entry 5', category: 'Phase B' },
  { x: 55, y: 84, label: 'Entry 6', category: 'Phase B' },
  { x: 62, y: 78, label: 'Entry 7', category: 'Phase C' },
  { x: 74, y: 92, label: 'Entry 8', category: 'Phase C' },
  { x: 85, y: 96, label: 'Entry 9', category: 'Phase C' },
];

export const Default: Story = {
  args: {
    title: 'Duration vs Contemplation Depth',
    subtitle: 'X/Y correlation plot with computed linear regression trendline',
    xLabel: 'Session Time (min)',
    yLabel: 'Depth Score',
    data: points,
    height: 300,
    showTrendline: true,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '680px' }}>
      <ScatterPlotChart {...args} />
    </div>
  ),
};
