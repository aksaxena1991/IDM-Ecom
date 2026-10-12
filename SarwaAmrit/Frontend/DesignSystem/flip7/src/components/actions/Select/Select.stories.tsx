import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const meta: Meta<typeof Select> = { title: 'Actions/Select', component: Select, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    label: 'Table size',
    options: [
      { value: '3', label: '3 players' },
      { value: '4', label: '4 players' },
      { value: '5', label: '5 players' },
    ],
  },
  decorators: [(Story) => <div style={{ width: 280, minHeight: 220 }}><Story /></div>],
};
