import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateRangePicker } from './DateRangePicker';
const meta: Meta<typeof DateRangePicker> = { title: 'Pickers/DateRangePicker', component: DateRangePicker, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof DateRangePicker>;
export const Default: Story = { args: { label: 'Tournament window' }, decorators: [(S) => <div style={{ width: 420, minHeight: 360 }}><S /></div>] };
