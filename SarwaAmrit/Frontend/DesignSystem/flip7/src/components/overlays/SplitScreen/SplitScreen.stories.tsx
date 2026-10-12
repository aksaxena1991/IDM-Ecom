import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplitScreen } from './SplitScreen';
const meta: Meta<typeof SplitScreen> = { title: 'Overlays/SplitScreen', component: SplitScreen, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof SplitScreen>;
export const Default: Story = {
  args: { left: 'This round', right: 'Running totals' },
  decorators: [(S) => <div style={{ width: 480 }}><S /></div>],
};
