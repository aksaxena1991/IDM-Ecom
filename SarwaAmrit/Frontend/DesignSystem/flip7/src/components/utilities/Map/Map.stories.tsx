import type { Meta, StoryObj } from '@storybook/react-vite';
import { Map } from './Map';
const meta: Meta<typeof Map> = { title: 'Utilities/Map', component: Map, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Map>;
export const Default: Story = { decorators: [(S) => <div style={{ width: 360 }}><S /></div>] };
