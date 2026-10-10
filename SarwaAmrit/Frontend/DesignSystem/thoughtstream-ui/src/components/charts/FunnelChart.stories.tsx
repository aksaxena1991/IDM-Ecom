import type { Meta, StoryObj } from '@storybook/react';
import { FunnelChart } from './FunnelChart';

const meta: Meta<typeof FunnelChart> = {
  title: 'Data Visualization/FunnelChart',
  component: FunnelChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    height: { control: { type: 'range', min: 200, max: 500, step: 20 } },
    showConversionRates: { control: 'boolean' },
    borderless: { control: 'boolean' },
    onStageClick: { action: 'stageClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof FunnelChart>;

const sampleStages = [
  { key: 'visitors', label: 'Curious Explorers', value: 12500, color: '#1C1917' },
  { key: 'subscribers', label: 'Newsletter Readers', value: 6200, color: '#44403C' },
  { key: 'active', label: 'Daily Journalers', value: 2800, color: '#57534E' },
  { key: 'patrons', label: 'Patrons & Fellows', value: 950, color: '#78716C' },
];

export const Default: Story = {
  args: {
    title: 'Reader Engagement Funnel',
    subtitle: 'Conversion steps with drop-off rates and retention percentages',
    stages: sampleStages,
    height: 320,
    showConversionRates: true,
    borderless: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '640px' }}>
      <FunnelChart {...args} />
    </div>
  ),
};
