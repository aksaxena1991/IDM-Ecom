import type { Meta, StoryObj } from '@storybook/react';
import { PieChart } from './PieChart';

const meta: Meta<typeof PieChart> = {
  title: 'Data Visualization/PieChart',
  component: PieChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    size: { control: { type: 'range', min: 180, max: 450, step: 10 } },
    showLegend: { control: 'boolean' },
    showLabels: { control: 'boolean' },
    borderless: { control: 'boolean' },
    onSliceClick: { action: 'sliceClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof PieChart>;

const sampleData = [
  { label: 'Contemplative Writing', value: 45, color: '#1C1917' },
  { label: 'Literature & Philosophy', value: 25, color: '#44403C' },
  { label: 'System Architecture', value: 20, color: '#78716C' },
  { label: 'Meditation & Solitude', value: 10, color: '#A8A29E' },
];

export const Default: Story = {
  args: {
    title: 'Attention Distribution',
    subtitle: 'Pure SVG pie chart with hairline separation and wedge hover tracking',
    data: sampleData,
    size: 280,
    showLegend: true,
    showLabels: false,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '600px' }}>
      <PieChart {...args} />
    </div>
  ),
};

export const WithPercentageLabels: Story = {
  args: {
    ...Default.args,
    showLabels: true,
  },
  render: (args) => (
    <div style={{ maxWidth: '600px' }}>
      <PieChart {...args} />
    </div>
  ),
};
