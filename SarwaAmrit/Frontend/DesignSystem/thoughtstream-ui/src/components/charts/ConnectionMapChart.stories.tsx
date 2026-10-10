import type { Meta, StoryObj } from '@storybook/react';
import { ConnectionMapChart } from './ConnectionMapChart';

const meta: Meta<typeof ConnectionMapChart> = {
  title: 'Data Visualization/ConnectionMapChart',
  component: ConnectionMapChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 200, max: 480, step: 20 } },
    borderless: { control: 'boolean' },
    onConnectionClick: { action: 'connectionClicked' },
    onHubClick: { action: 'hubClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionMapChart>;

const hubs = [
  { id: 'tokyo', label: 'Tokyo', x: 80, y: 35 },
  { id: 'london', label: 'London', x: 45, y: 30 },
  { id: 'ny', label: 'New York', x: 25, y: 40 },
  { id: 'sf', label: 'San Francisco', x: 12, y: 45 },
];

const connections = [
  { from: 'sf', to: 'ny', value: 14200, label: 'Domestic Trunk' },
  { from: 'ny', to: 'london', value: 28400, label: 'Transatlantic Arc' },
  { from: 'london', to: 'tokyo', value: 19800, label: 'Eurasian Arc' },
  { from: 'tokyo', to: 'sf', value: 31200, label: 'Transpacific Arc' },
];

export const Default: Story = {
  args: {
    title: 'Distributed Sync Backbone',
    subtitle: 'Curved quadratic bezier flow lines connecting geographic hubs',
    hubs,
    connections,
    height: 320,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <ConnectionMapChart {...args} />
    </div>
  ),
};
