import type { Meta, StoryObj } from '@storybook/react';
import { PinMapChart } from './PinMapChart';

const meta: Meta<typeof PinMapChart> = {
  title: 'Data Visualization/PinMapChart',
  component: PinMapChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 200, max: 480, step: 20 } },
    borderless: { control: 'boolean' },
    onPinClick: { action: 'pinClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof PinMapChart>;

const pins = [
  { id: 'p1', label: 'Kyoto Studio', x: 22, y: 35, count: 18, category: 'HQ' },
  { id: 'p2', label: 'Reykjavik Archive', x: 45, y: 20, count: 7, category: 'Node' },
  { id: 'p3', label: 'Zurich Atelier', x: 52, y: 45, count: 12, category: 'Studio' },
  { id: 'p4', label: 'Kyoto South', x: 75, y: 65, count: 9, category: 'Node' },
];

export const Default: Story = {
  args: {
    title: 'Global Contemplation Studios',
    subtitle: 'Geographic coordinate plane with 0px sharp badge pins and counts',
    pins,
    height: 320,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <PinMapChart {...args} />
    </div>
  ),
};
