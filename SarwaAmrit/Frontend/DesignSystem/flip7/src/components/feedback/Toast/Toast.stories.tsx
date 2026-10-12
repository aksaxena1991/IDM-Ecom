import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast, ToastProvider, useToast } from './Toast';
import { Button } from '../../actions/Button';

const meta: Meta<typeof Toast> = { title: 'Feedback/Toast', component: Toast, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Toast>;

export const Static: Story = {
  args: { title: 'Flip7!', description: 'Bonus awarded', variant: 'success' },
};

const PushDemo = () => {
  const { push } = useToast();
  return <Button onClick={() => push({ title: 'BOOM', description: 'Kai busted', variant: 'error' })}>Show toast</Button>;
};

export const Live: Story = {
  render: () => (
    <ToastProvider>
      <PushDemo />
    </ToastProvider>
  ),
};
