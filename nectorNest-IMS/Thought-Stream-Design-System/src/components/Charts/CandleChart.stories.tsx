import type { Meta, StoryObj } from '@storybook/react';
import { CandleChart } from './CandleChart';

const meta: Meta<typeof CandleChart> = {
  title: 'Data Visualization/CandleChart',
  component: CandleChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 200, max: 450, step: 10 } },
    bullishColor: { control: 'color' },
    bearishColor: { control: 'color' },
    borderless: { control: 'boolean' },
    onCandleClick: { action: 'candleClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof CandleChart>;

const candleData = [
  { label: 'Oct 01', open: 142.5, high: 146.0, low: 141.2, close: 145.4 },
  { label: 'Oct 02', open: 145.2, high: 147.8, low: 144.0, close: 146.9 },
  { label: 'Oct 03', open: 147.0, high: 148.5, low: 143.2, close: 144.1 },
  { label: 'Oct 04', open: 144.0, high: 146.5, low: 142.8, close: 146.2 },
  { label: 'Oct 05', open: 146.5, high: 151.0, low: 145.5, close: 150.3 },
  { label: 'Oct 06', open: 150.0, high: 152.4, low: 148.6, close: 149.2 },
  { label: 'Oct 07', open: 149.5, high: 153.8, low: 149.0, close: 153.1 },
];

export const Default: Story = {
  args: {
    title: 'Market Volatility Synthesis',
    subtitle: 'OHLC financial candlesticks with 0px sharp rectangular bodies and hairline wicks',
    data: candleData,
    height: 280,
    bullishColor: '#57534E',
    bearishColor: '#1C1917',
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <CandleChart {...args} />
    </div>
  ),
};
