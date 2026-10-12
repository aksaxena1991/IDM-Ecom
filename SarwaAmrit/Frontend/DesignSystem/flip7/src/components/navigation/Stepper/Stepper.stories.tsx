import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper';
const meta: Meta<typeof Stepper> = { title: 'Navigation/Stepper', component: Stepper, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Stepper>;
export const Default: Story = {
  args: {
    activeIndex: 1,
    steps: [
      { id: 'setup', label: 'Setup' },
      { id: 'play', label: 'Play' },
      { id: 'win', label: 'Victory' },
    ],
  },
};
