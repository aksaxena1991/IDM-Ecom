import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calculator } from './Calculator';
const meta: Meta<typeof Calculator> = { title: 'Utilities/Calculator', component: Calculator, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Calculator>;
export const Default: Story = { decorators: [(S) => <div style={{ width: 260 }}><S /></div>] };
