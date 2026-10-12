import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';
const meta: Meta<typeof Chip> = { title: 'Display/Chip', component: Chip, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Chip>;
export const Filter: Story = { args: { children: 'First player', selected: true } };
export const Status: Story = { args: { variant: 'status', tone: 'coral', children: 'BOOM' } };
