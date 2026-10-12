import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimeRangePicker } from './TimeRangePicker';
const meta: Meta<typeof TimeRangePicker> = { title: 'Pickers/TimeRangePicker', component: TimeRangePicker, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof TimeRangePicker>;
export const Default: Story = { args: { label: 'Session' }, decorators: [(S) => <div style={{ width: 360 }}><S /></div>] };
