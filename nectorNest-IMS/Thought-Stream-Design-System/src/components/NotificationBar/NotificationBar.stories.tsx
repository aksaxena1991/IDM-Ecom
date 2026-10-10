import type { Meta, StoryObj } from '@storybook/react';
import { NotificationBar } from './NotificationBar';

const meta: Meta<typeof NotificationBar> = {
  title: 'Feedback/NotificationBar',
  component: NotificationBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls visibility of notification bar',
    },
    variant: {
      control: 'select',
      options: ['neutral', 'info', 'announcement', 'warning', 'error', 'success'],
      description: 'Visual status intent and tone',
    },
    layout: {
      control: 'inline-radio',
      options: ['full-width', 'contained', 'floating'],
      description: 'Layout containment style',
    },
    position: {
      control: 'select',
      options: ['static', 'sticky', 'fixed-top', 'fixed-bottom'],
      description: 'Screen positioning mode',
    },
    title: {
      control: 'text',
      description: 'Primary subject or headline',
    },
    description: {
      control: 'text',
      description: 'Supporting editorial explanation',
    },
    badge: {
      control: 'text',
      description: 'Monospace status badge',
    },
    dismissible: {
      control: 'boolean',
      description: 'Renders sharp 0px close button',
    },
    autoHideDuration: {
      control: 'number',
      description: 'Automatic hide delay in milliseconds',
    },
    onDismiss: { action: 'dismissed' },
    onActionClick: { action: 'actionClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof NotificationBar>;

export const Default: Story = {
  args: {
    open: true,
    variant: 'neutral',
    layout: 'full-width',
    title: 'System Notice:',
    description: 'Scheduled manuscript backup will occur tonight at 02:00 UTC.',
    badge: 'SYSTEM',
    dismissible: true,
    action: {
      label: 'View Schedule',
    },
  },
  render: (args) => <NotificationBar {...args} />,
};

export const Announcement: Story = {
  args: {
    open: true,
    variant: 'announcement',
    layout: 'contained',
    badge: 'Zenith 2.0',
    title: 'ThoughtStream 2.0 is now live.',
    description: 'Explore the new Zen SplitGrid and Data Visualization Suite.',
    dismissible: true,
    action: {
      label: 'Read Release Notes',
    },
  },
  render: (args) => <NotificationBar {...args} />,
};

export const WarningOffline: Story = {
  args: {
    open: true,
    variant: 'warning',
    layout: 'contained',
    badge: 'OFFLINE',
    title: 'Connection interrupted.',
    description: 'Working in local offline contemplation mode. Changes saved locally.',
    dismissible: true,
    action: {
      label: 'Retry Connection',
    },
  },
  render: (args) => <NotificationBar {...args} />,
};

export const ErrorState: Story = {
  args: {
    open: true,
    variant: 'error',
    layout: 'full-width',
    badge: 'SYNC ERROR',
    title: 'Sync failure:',
    description: 'Unable to synchronize thoughts with remote repository. Storage limit exceeded.',
    dismissible: true,
    action: {
      label: 'Resolve Issue',
    },
  },
  render: (args) => <NotificationBar {...args} />,
};

export const SuccessState: Story = {
  args: {
    open: true,
    variant: 'success',
    layout: 'full-width',
    badge: 'SUCCESS',
    title: 'Manuscript compiled:',
    description: 'Exported 14,200 words to PDF without formatting degradation.',
    dismissible: true,
    action: {
      label: 'Download PDF',
    },
  },
  render: (args) => <NotificationBar {...args} />,
};

export const FloatingLayout: Story = {
  args: {
    open: true,
    layout: 'floating',
    variant: 'info',
    badge: 'TIP',
    title: 'Distraction-free shortcut:',
    description: 'Press Cmd + Shift + F anywhere to enter Zenith writing mode.',
    dismissible: true,
    action: {
      label: 'View All Shortcuts',
    },
  },
  render: (args) => <NotificationBar {...args} />,
};

export const AllVariantsOverview: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '880px' }}>
      <NotificationBar
        {...args}
        variant="neutral"
        badge="SYSTEM"
        title="Contemplation buffer active."
        description="Local changes are mirrored into non-volatile storage."
        dismissible
      />
      <NotificationBar
        {...args}
        variant="info"
        badge="UPDATE"
        title="Version 2.4 available."
        description="A lightweight update is ready to be applied."
        action={{ label: 'Apply Now' }}
        dismissible
      />
      <NotificationBar
        {...args}
        variant="announcement"
        badge="FEATURE"
        title="Zen mode enabled by default."
        description="Background distractions are automatically quieted."
        dismissible
      />
      <NotificationBar
        {...args}
        variant="warning"
        badge="BATTERY"
        title="Power reserve low."
        description="Local drafting cache preserved; syncing paused."
        action={{ label: 'Plug in Device' }}
        dismissible
      />
      <NotificationBar
        {...args}
        variant="error"
        badge="ALERT"
        title="Publishing threshold blocked."
        description="A required metadata field remains unfulfilled."
        action={{ label: 'Review Fields' }}
        dismissible
      />
      <NotificationBar
        {...args}
        variant="success"
        badge="COMPLETED"
        title="Repository sync harmonious."
        description="All 48 manuscripts verified against cryptographic hash."
        dismissible
      />
    </div>
  ),
};
