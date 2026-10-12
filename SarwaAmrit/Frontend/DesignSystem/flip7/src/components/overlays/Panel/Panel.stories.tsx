import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel } from './Panel';
const meta: Meta<typeof Panel> = { title: 'Overlays/Panel', component: Panel, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Panel>;
export const Default: Story = { args: { title: 'Score pad', children: 'Keep totals on cream paper.' }, decorators: [(S) => <div style={{ width: 320 }}><S /></div>] };
