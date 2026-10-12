import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
const meta: Meta<typeof Icon> = { title: 'Display/Icon', component: Icon, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Icon>;
export const Trophy: Story = { args: { children: '🏆', label: 'Trophy', tone: 'gold', size: 48 } };
