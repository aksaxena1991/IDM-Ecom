import type { Meta, StoryObj } from '@storybook/react';
import { GanttChart } from './GanttChart';

const meta: Meta<typeof GanttChart> = {
  title: 'Data Visualization/GanttChart',
  component: GanttChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    today: { control: { type: 'number', min: 0, max: 14, step: 1 } },
    rowHeight: { control: { type: 'range', min: 28, max: 56, step: 2 } },
    borderless: { control: 'boolean' },
    onTaskClick: { action: 'taskClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof GanttChart>;

const sampleTasks = [
  { id: 't1', label: 'Foundation & Tokens', start: 0, end: 3, progress: 100, color: '#1C1917' },
  { id: 't2', label: 'Layout & SplitGrid', start: 2, end: 5, progress: 85, color: '#44403C' },
  { id: 't3', label: 'Data Visualization Suite', start: 3, end: 7, progress: 70, color: '#1C1917' },
  { id: 't4', label: 'Documentation & Storybook', start: 6, end: 9, progress: 30, color: '#78716C' },
  { id: 't5', label: 'Packaging & NPM Release', start: 8, end: 11, progress: 0, color: '#A8A29E' },
];

export const Default: Story = {
  args: {
    title: 'Release Roadmap: Zenith 2.0',
    subtitle: 'Task milestone schedule with 0px sharp rectangular bars and progress shading',
    today: 4,
    tasks: sampleTasks,
    rowHeight: 36,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '780px' }}>
      <GanttChart {...args} />
    </div>
  ),
};
