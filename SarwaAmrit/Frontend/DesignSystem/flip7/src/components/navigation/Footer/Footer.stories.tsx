import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';
const meta: Meta<typeof Footer> = { title: 'Navigation/Footer', component: Footer, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Footer>;
export const Default: Story = { decorators: [(S) => <div style={{ width: 360 }}><S /></div>] };
