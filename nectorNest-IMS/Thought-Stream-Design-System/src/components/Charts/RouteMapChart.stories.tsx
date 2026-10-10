import type { Meta, StoryObj } from '@storybook/react';
import { RouteMapChart } from './RouteMapChart';

const meta: Meta<typeof RouteMapChart> = {
  title: 'Data Visualization/RouteMapChart',
  component: RouteMapChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 200, max: 480, step: 20 } },
    routeColor: { control: 'color' },
    borderless: { control: 'boolean' },
    onWaypointClick: { action: 'waypointClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof RouteMapChart>;

const waypoints = [
  { id: 'w1', label: 'Kyoto Sanctuary', x: 15, y: 70, eta: '08:00', status: 'completed' as const },
  { id: 'w2', label: 'Philosopher Path', x: 35, y: 40, eta: '10:30', status: 'completed' as const },
  { id: 'w3', label: 'Cedar Forest', x: 60, y: 55, eta: '13:00', status: 'current' as const },
  { id: 'w4', label: 'Summit Pavilion', x: 85, y: 25, eta: '16:30', status: 'pending' as const },
];

export const Default: Story = {
  args: {
    title: 'Pilgrim Journey Route',
    subtitle: 'Sequential waypoints connected by directional dashed hairline trajectory',
    waypoints,
    height: 300,
    routeColor: '#1C1917',
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <RouteMapChart {...args} />
    </div>
  ),
};
