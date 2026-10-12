import type { Meta, StoryObj } from '@storybook/react-vite';
import { Multiselect } from './Multiselect';

const meta: Meta<typeof Multiselect> = { title: 'Actions/Multiselect', component: Multiselect, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Multiselect>;

export const Default: Story = {
  args: {
    label: 'House rules',
    options: [
      { value: 'flip7', label: 'Flip7 bonus' },
      { value: 'freeze', label: 'Freeze' },
      { value: 'x2', label: '×2' },
    ],
  },
  decorators: [(Story) => <div style={{ width: 320, minHeight: 240 }}><Story /></div>],
};
