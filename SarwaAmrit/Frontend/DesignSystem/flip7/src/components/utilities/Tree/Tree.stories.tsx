import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tree } from './Tree';
const meta: Meta<typeof Tree> = { title: 'Utilities/Tree', component: Tree, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Tree>;
export const Default: Story = {
  args: {
    data: [
      { id: 't1', label: 'Table 1', children: [{ id: 'm', label: 'Maya' }, { id: 'r', label: 'Riley' }] },
      { id: 't2', label: 'Table 2', children: [{ id: 'k', label: 'Kai' }] },
    ],
  },
};
