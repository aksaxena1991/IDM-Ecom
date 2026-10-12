import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from './ThemeProvider';
import { Button } from '../../actions/Button';

const meta: Meta<typeof ThemeProvider> = { title: 'Theme/ThemeProvider', component: ThemeProvider, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof ThemeProvider>;

export const Default: Story = {
  render: () => (
    <ThemeProvider>
      <Button>Inside Flip7 root</Button>
    </ThemeProvider>
  ),
};
