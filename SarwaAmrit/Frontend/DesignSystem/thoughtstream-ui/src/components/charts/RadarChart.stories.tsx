import type { Meta, StoryObj } from '@storybook/react';
import { RadarChart } from './RadarChart';

const meta: Meta<typeof RadarChart> = {
  title: 'Data Visualization/RadarChart',
  component: RadarChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    size: { control: { type: 'range', min: 240, max: 500, step: 20 } },
    levels: { control: { type: 'range', min: 2, max: 6, step: 1 } },
    showLegend: { control: 'boolean' },
    borderless: { control: 'boolean' },
    onVertexClick: { action: 'vertexClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof RadarChart>;

const dimensions = [
  { key: 'simplicity', label: 'Simplicity', max: 100 },
  { key: 'focus', label: 'Focus', max: 100 },
  { key: 'typography', label: 'Typography', max: 100 },
  { key: 'speed', label: 'Speed', max: 100 },
  { key: 'harmony', label: 'Harmony', max: 100 },
  { key: 'utility', label: 'Utility', max: 100 },
];

const radarData = {
  thoughtStream: {
    simplicity: 96,
    focus: 94,
    typography: 98,
    speed: 92,
    harmony: 90,
    utility: 88,
  },
  standardUI: {
    simplicity: 62,
    focus: 50,
    typography: 70,
    speed: 78,
    harmony: 65,
    utility: 82,
  },
};

export const Default: Story = {
  args: {
    title: 'Design Language Footprint',
    subtitle: 'Multi-axis radar evaluation comparing ThoughtStream vs Conventional Design',
    dimensions,
    series: [
      { key: 'thoughtStream', label: 'ThoughtStream UI', color: '#1C1917', fillOpacity: 0.25 },
      { key: 'standardUI', label: 'Conventional UI', color: '#A8A29E', fillOpacity: 0.15 },
    ],
    data: radarData,
    size: 360,
    levels: 4,
    showLegend: true,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '640px' }}>
      <RadarChart {...args} />
    </div>
  ),
};
