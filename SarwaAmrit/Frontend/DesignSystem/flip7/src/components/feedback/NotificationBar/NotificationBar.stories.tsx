import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationBar } from './NotificationBar';
const meta: Meta<typeof NotificationBar> = { title: 'Feedback/NotificationBar', component: NotificationBar, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof NotificationBar>;
export const Default: Story = { args: { children: 'First player: Maya', tone: 'gold' } };
