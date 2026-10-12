import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';
const meta: Meta<typeof ProgressBar> = { title: 'Display/ProgressBar', component: ProgressBar, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof ProgressBar>;
export const Default: Story = { args: { value: 72, label: 'To 200', tone: 'gold' }, decorators: [(S) => <div style={{ width: 280 }}><S /></div>] };
