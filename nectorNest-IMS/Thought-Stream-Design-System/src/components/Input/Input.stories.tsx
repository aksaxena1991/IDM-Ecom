import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';
import { Search, Mail } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Publication Title',
    placeholder: 'e.g. Reflections on Stillness',
    helperText: 'Choose a concise and memorable title for your letter.',
  },
};

export const WithLeadingIcon: Story = {
  args: {
    label: 'Search Essays',
    placeholder: 'Search topics, authors, or themes...',
    leadingIcon: <Search size={18} />,
  },
};

export const WithTrailingIcon: Story = {
  args: {
    label: 'Newsletter Email',
    type: 'email',
    placeholder: 'reader@domain.com',
    trailingIcon: <Mail size={18} />,
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Subscriber Email',
    defaultValue: 'invalid-email-address',
    error: 'Please enter a valid email address with a domain.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Archived Slug',
    defaultValue: 'vol-1-solitude-and-craft',
    disabled: true,
    helperText: 'This identifier is locked permanently.',
  },
};
