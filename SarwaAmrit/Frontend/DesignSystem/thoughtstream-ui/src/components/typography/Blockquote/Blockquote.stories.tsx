import type { Meta, StoryObj } from '@storybook/react-vite';
import { Blockquote } from './Blockquote';

const meta: Meta<typeof Blockquote> = {
  title: 'Components/Blockquote',
  component: Blockquote,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Blockquote>;

export const Default: Story = {
  args: {
    children:
      'Order and simplification are the first steps toward the mastery of a subject. When space is respected, every thought carries deliberate weight.',
    citation: 'Thomas Mann',
  },
};

export const WithoutCitation: Story = {
  args: {
    children: 'Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.',
  },
};
