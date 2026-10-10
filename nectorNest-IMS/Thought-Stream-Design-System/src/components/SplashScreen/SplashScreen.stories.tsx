import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SplashScreen } from './SplashScreen';
import { Button } from '../Button';

const meta: Meta<typeof SplashScreen> = {
  title: 'Feedback/SplashScreen',
  component: SplashScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls visibility of the splash screen',
    },
    mode: {
      control: 'inline-radio',
      options: ['embedded', 'fullscreen'],
      description: 'Display mode: embedded card or fullscreen overlay',
    },
    title: {
      control: 'text',
      description: 'Primary title in Libre Baskerville',
    },
    subtitle: {
      control: 'text',
      description: 'Secondary subtitle or descriptive explanation',
    },
    quote: {
      control: 'text',
      description: 'Contemplative italicized aphorism or motto',
    },
    status: {
      control: 'text',
      description: 'Current status or boot sequence message',
    },
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress percentage (0-100) or indeterminate if unset',
    },
    showProgress: {
      control: 'boolean',
      description: 'Displays the hairline progress indicator',
    },
    actionText: {
      control: 'text',
      description: 'Label for interactive enter or continue button',
    },
    allowSkip: {
      control: 'boolean',
      description: 'Displays discrete skip button',
    },
    autoDismiss: {
      control: 'boolean',
      description: 'Automatically dismisses after timeout',
    },
    autoDismissDelay: {
      control: 'number',
      description: 'Delay in milliseconds before auto-dismissing',
    },
    version: {
      control: 'text',
      description: 'Monospace version tag in footer',
    },
    onAction: { action: 'actionClicked' },
    onSkip: { action: 'skipClicked' },
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<typeof SplashScreen>;

export const EmbeddedContemplation: Story = {
  args: {
    open: true,
    mode: 'embedded',
    title: 'ThoughtStream',
    quote: '“In the quiet space between thoughts, clarity appears.”',
    status: 'Calibrating contemplation stream...',
    version: 'Zenith 2.0',
    actionText: 'Enter Workspace',
    allowSkip: false,
    showProgress: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <SplashScreen {...args} />
    </div>
  ),
};

export const DeterminateLoading: Story = {
  args: {
    open: true,
    mode: 'embedded',
    title: 'Archive Restoration',
    subtitle: 'Reconstituting local manuscript database from encrypted snapshots.',
    progress: 68,
    status: 'Restoring index: 68% complete',
    actionText: 'Continue in Background',
    allowSkip: true,
    version: 'Restoration Node v1.4',
    showProgress: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <SplashScreen {...args} />
    </div>
  ),
};

export const FullscreenOverlay: Story = {
  args: {
    open: true,
    mode: 'fullscreen',
    title: 'ThoughtStream',
    quote: '“To see things in the stillness of thought is the beginning of wisdom.”',
    status: 'Synchronizing contemplation stream...',
    actionText: 'Enter Workspace',
    allowSkip: true,
    version: 'Zenith 2.0',
    showProgress: true,
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.open ?? true);

    return (
      <div style={{ maxWidth: 540 }}>
        {!isOpen && (
          <Button variant="primary" size="medium" onClick={() => setIsOpen(true)}>
            Relaunch Fullscreen Splash
          </Button>
        )}
        <SplashScreen
          {...args}
          open={isOpen}
          onAction={() => {
            args.onAction?.();
            setIsOpen(false);
          }}
          onSkip={() => {
            args.onSkip?.();
            setIsOpen(false);
          }}
          onDismiss={() => {
            args.onDismiss?.();
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
};

export const InteractiveFullscreenDemo: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontFamily: 'var(--ts-font-sans)', fontSize: '14px', color: 'var(--ts-color-text-secondary)', lineHeight: 1.6 }}>
          Click the button below to launch the fullscreen contemplative splash screen. You can dismiss it by clicking <strong>Enter Workspace</strong> or <strong>Skip intro</strong>, which triggers Storybook action logs.
        </p>

        <Button variant="primary" size="medium" onClick={() => setIsOpen(true)}>
          Launch Fullscreen Splash Screen
        </Button>

        {isOpen && (
          <SplashScreen
            {...args}
            mode="fullscreen"
            open={isOpen}
            title="ThoughtStream"
            quote="“To see things in the stillness of thought is the beginning of wisdom.”"
            status={[
              'Connecting peer nodes...',
              'Synchronizing split grids...',
              'Workspace harmonized.',
            ]}
            actionText="Enter Workspace"
            allowSkip
            onAction={() => {
              args.onAction?.();
              setIsOpen(false);
            }}
            onSkip={() => {
              args.onSkip?.();
              setIsOpen(false);
            }}
            onDismiss={() => {
              args.onDismiss?.();
              setIsOpen(false);
            }}
          />
        )}
      </div>
    );
  },
};
