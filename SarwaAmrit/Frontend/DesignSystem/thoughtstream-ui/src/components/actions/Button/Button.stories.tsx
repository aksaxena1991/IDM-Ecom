import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { ArrowRight, Trash2, Mail, RefreshCw } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ThoughtStream Buttons feature 0px border radius, flat styling, and subtle hover/active states with precise Inter 600 typography.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'The visual style variant of the button.',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size tier (padding and typography size).',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is interactive.',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the button is in an active loading state.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether to span 100% of the container width.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Read Essay',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Browse Archive',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Cancel',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete Publication',
    leftIcon: <Trash2 size={16} />,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Button size="small">Small (8px 16px / 13px)</Button>
      <Button size="medium">Medium (12px 24px / 15px)</Button>
      <Button size="large">Large (16px 36px / 17px)</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Button leftIcon={<Mail size={16} />}>Subscribe to Letter</Button>
      <Button variant="secondary" rightIcon={<ArrowRight size={16} />}>
        Next Chapter
      </Button>
      <Button variant="ghost" leftIcon={<RefreshCw size={16} />} isLoading>
        Refreshing
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Button disabled>Primary Disabled</Button>
      <Button variant="secondary" disabled>
        Secondary Disabled
      </Button>
      <Button variant="destructive" disabled>
        Destructive Disabled
      </Button>
    </div>
  ),
};
