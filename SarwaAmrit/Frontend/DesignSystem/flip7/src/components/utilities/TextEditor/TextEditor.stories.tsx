import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextEditor } from './TextEditor';
const meta: Meta<typeof TextEditor> = { title: 'Utilities/TextEditor', component: TextEditor, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof TextEditor>;
export const Default: Story = { decorators: [(S) => <div style={{ width: 360 }}><S /></div>] };
