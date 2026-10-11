import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionTitle } from './SectionTitle';

const meta: Meta<typeof SectionTitle> = {
  title: 'Display/SectionTitle',
  component: SectionTitle,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SectionTitle>;

export const Players: Story = {
  args: { emoji: '🎴', children: 'Players' },
};

export const ThisRound: Story = {
  args: { emoji: '🎯', children: 'This round' },
};
