import type { Meta, StoryObj } from '@storybook/react';
import { HistogramChart } from './HistogramChart';

const meta: Meta<typeof HistogramChart> = {
  title: 'Data Visualization/HistogramChart',
  component: HistogramChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    binCount: { control: { type: 'range', min: 4, max: 15, step: 1 } },
    height: { control: { type: 'range', min: 180, max: 450, step: 10 } },
    showCurve: { control: 'boolean' },
    color: { control: 'color' },
    borderless: { control: 'boolean' },
    onBinClick: { action: 'binClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof HistogramChart>;

const essayLengths = [
  420, 560, 680, 710, 750, 820, 860, 890, 920, 950,
  980, 1020, 1050, 1100, 1150, 1180, 1220, 1290, 1340, 1420,
  1480, 1550, 1620, 1750, 1820, 1900, 2100, 2300, 2450
];

export const Default: Story = {
  args: {
    title: 'Article Word Count Distribution',
    subtitle: 'Contiguous 0px frequency distribution bins with normal bell curve overlay',
    data: essayLengths,
    binCount: 7,
    height: 260,
    showCurve: true,
    color: '#1C1917',
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '680px' }}>
      <HistogramChart {...args} />
    </div>
  ),
};
