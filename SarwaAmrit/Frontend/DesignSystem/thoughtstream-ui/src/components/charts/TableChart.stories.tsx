import type { Meta, StoryObj } from '@storybook/react';
import { TableChart } from './TableChart';

const meta: Meta<typeof TableChart> = {
  title: 'Data Visualization/TableChart',
  component: TableChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    borderless: { control: 'boolean' },
    onRowClick: { action: 'rowClicked' },
    onCellClick: { action: 'cellClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof TableChart>;

const tableData = [
  { id: 1, name: 'Minimalist Architecture', category: 'Essays', readers: 14200, rating: 98, trend: [12, 14, 18, 22, 28, 34, 42] },
  { id: 2, name: 'Typographic Restraint', category: 'Guides', readers: 9800, rating: 94, trend: [20, 22, 21, 24, 25, 29, 31] },
  { id: 3, name: 'Flat Plane Geometry', category: 'Tokens', readers: 7400, rating: 91, trend: [10, 15, 12, 18, 20, 24, 26] },
  { id: 4, name: 'Silence & Whitespace', category: 'Essays', readers: 16500, rating: 99, trend: [25, 28, 32, 38, 44, 49, 55] },
  { id: 5, name: 'Monospace Precision', category: 'Code', readers: 5600, rating: 88, trend: [18, 17, 19, 18, 20, 21, 22] },
];

const columns = [
  { key: 'name', header: 'Document', align: 'left' as const },
  { key: 'category', header: 'Type', type: 'badge' as const },
  { key: 'trend', header: '7D Velocity', type: 'sparkline' as const, align: 'center' as const },
  { key: 'readers', header: 'Readership', type: 'bar' as const, max: 20000 },
  { key: 'rating', header: 'Zen Score', type: 'number' as const, formatter: (val: any) => `${val}%` },
];

export const Default: Story = {
  args: {
    title: 'Manuscript Analytics Table',
    subtitle: 'Data table chart with embedded micro-bars, SVG sparklines, and monospace metrics',
    columns,
    data: tableData,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '780px' }}>
      <TableChart {...args} />
    </div>
  ),
};
