import type { Meta, StoryObj } from '@storybook/react';
import { VennDiagramChart } from './VennDiagramChart';

const meta: Meta<typeof VennDiagramChart> = {
  title: 'Data Visualization/VennDiagramChart',
  component: VennDiagramChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    size: { control: { type: 'range', min: 220, max: 480, step: 20 } },
    borderless: { control: 'boolean' },
    onSetClick: { action: 'setClicked' },
    onIntersectionClick: { action: 'intersectionClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof VennDiagramChart>;

const sets = [
  { key: 'minimalism', label: 'Minimalism', value: 120, color: '#1C1917' },
  { key: 'utility', label: 'Utilitarian Precision', value: 95, color: '#57534E' },
  { key: 'contemplation', label: 'Quiet Contemplation', value: 85, color: '#78716C' },
];

const intersections = [
  { sets: ['minimalism', 'utility', 'contemplation'], label: 'ThoughtStream Core', value: 42 },
];

export const Default: Story = {
  args: {
    title: 'Zen Design Philosophy Intersection',
    subtitle: 'Overlapping set boundary diagram with translucent intersection shading',
    sets,
    intersections,
    size: 320,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '580px' }}>
      <VennDiagramChart {...args} />
    </div>
  ),
};

export const TwoSets: Story = {
  args: {
    title: 'Dual Philosophy Dyad',
    subtitle: 'Intersection of Form and Function',
    sets: [
      { key: 'form', label: 'Purity of Form', value: 100, color: '#1C1917' },
      { key: 'function', label: 'Functional Utility', value: 100, color: '#78716C' },
    ],
    intersections: [{ sets: ['form', 'function'], label: 'Harmony', value: 50 }],
    size: 300,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '580px' }}>
      <VennDiagramChart {...args} />
    </div>
  ),
};
