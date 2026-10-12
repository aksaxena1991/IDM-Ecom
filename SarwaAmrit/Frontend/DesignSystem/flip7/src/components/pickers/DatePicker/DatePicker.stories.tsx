import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = { title: 'Pickers/DatePicker', component: DatePicker, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof DatePicker>;
export const Default: Story = { args: { label: 'Game night' }, decorators: [(S) => <div style={{ width: 280, minHeight: 360 }}><S /></div>] };
export const Inline: Story = { args: { inline: true } };
