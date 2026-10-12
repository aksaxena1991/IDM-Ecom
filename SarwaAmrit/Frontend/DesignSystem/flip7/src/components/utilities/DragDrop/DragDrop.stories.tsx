import type { Meta, StoryObj } from '@storybook/react-vite';
import { DragDrop } from './DragDrop';
const meta: Meta<typeof DragDrop> = { title: 'Utilities/DragDrop', component: DragDrop, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof DragDrop>;
export const Default: Story = {
  args: { items: [{ id: '1', label: 'Maya' }, { id: '2', label: 'Riley' }, { id: '3', label: 'Kai' }] },
  decorators: [(S) => <div style={{ width: 280 }}><S /></div>],
};
