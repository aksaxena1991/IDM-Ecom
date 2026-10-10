import type { Meta, StoryObj } from '@storybook/react';
import { DensityMapChart } from './DensityMapChart';

const meta: Meta<typeof DensityMapChart> = {
  title: 'Data Visualization/DensityMapChart',
  component: DensityMapChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 200, max: 480, step: 20 } },
    borderless: { control: 'boolean' },
    onClusterClick: { action: 'clusterClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof DensityMapChart>;

const clusters = [
  { id: 'c1', label: 'Zone Alpha', x: 30, y: 40, density: 95 },
  { id: 'c2', label: 'Zone Beta', x: 65, y: 35, density: 72 },
  { id: 'c3', label: 'Zone Gamma', x: 45, y: 70, density: 48 },
  { id: 'c4', label: 'Zone Delta', x: 80, y: 75, density: 32 },
];

export const Default: Story = {
  args: {
    title: 'Regional Activity Density',
    subtitle: 'Multi-ring concentric intensity clusters showing geographic concentration',
    clusters,
    height: 320,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <DensityMapChart {...args} />
    </div>
  ),
};
