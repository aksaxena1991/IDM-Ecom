import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Actions/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pill buttons, 72rpx minimum height, bounce curve. Gold primary, coral BOOM, sky Flip7.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'boom', 'flip7', 'ghost'] },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Start round' },
};

export const Boom: Story = {
  args: { variant: 'boom', children: 'BOOM' },
};

export const BoomActive: Story = {
  args: { variant: 'boom', active: true, children: 'BOOM' },
};

export const Flip7Bonus: Story = {
  args: { variant: 'flip7', children: 'Flip7' },
};

export const Flip7Active: Story = {
  args: { variant: 'flip7', active: true, children: 'Flip7' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Skip' },
};

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
      <Button variant="primary">Start round</Button>
      <Button variant="boom">BOOM</Button>
      <Button variant="boom" active>
        BOOM
      </Button>
      <Button variant="flip7">Flip7</Button>
      <Button variant="flip7" active>
        Flip7
      </Button>
      <Button variant="ghost">Skip</Button>
    </div>
  ),
};
