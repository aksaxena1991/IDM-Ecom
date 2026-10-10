import type { Meta, StoryObj } from '@storybook/react';
import { ChartTooltip } from './ChartTooltip';

const meta: Meta<typeof ChartTooltip> = {
  title: 'Data Visualization/ChartTooltip',
  component: ChartTooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Tooltip badge header' },
    x: { control: { type: 'range', min: 0, max: 400, step: 10 } },
    y: { control: { type: 'range', min: 0, max: 200, step: 10 } },
    visible: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ChartTooltip>;

export const Default: Story = {
  args: {
    x: 180,
    y: 110,
    title: 'June 2026 Metrics',
    visible: true,
    items: [
      { label: 'Visitors', value: 3400, formattedValue: '3,400 readers', color: '#1C1917' },
      { label: 'Pageviews', value: 6100, formattedValue: '6,100 impressions', color: '#78716C' },
      { label: 'Conversion', value: '42.8%', color: '#65A30D' },
    ],
  },
  render: (args) => (
    <div
      style={{
        position: 'relative',
        width: '360px',
        height: '180px',
        border: '1px dashed var(--ts-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ChartTooltip {...args} />
      <span style={{ fontFamily: 'var(--ts-font-mono)', fontSize: '11px', color: 'var(--ts-color-text-tertiary)' }}>
        [Anchor Target ({args.x}px, {args.y}px)]
      </span>
    </div>
  ),
};
