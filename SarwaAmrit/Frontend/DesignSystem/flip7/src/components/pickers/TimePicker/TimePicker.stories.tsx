import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimePicker } from './TimePicker';
const meta: Meta<typeof TimePicker> = { title: 'Pickers/TimePicker', component: TimePicker, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof TimePicker>;
export const Default: Story = { args: { label: 'Kickoff' } };
