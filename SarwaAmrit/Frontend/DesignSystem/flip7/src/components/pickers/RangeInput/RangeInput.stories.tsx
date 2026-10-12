import type { Meta, StoryObj } from '@storybook/react-vite';
import { RangeInput } from './RangeInput';

const meta: Meta<typeof RangeInput> = { title: 'Pickers/RangeInput', component: RangeInput, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof RangeInput>;
export const Default: Story = { args: { label: 'Target score', defaultValue: 200, min: 50, max: 400 } };
