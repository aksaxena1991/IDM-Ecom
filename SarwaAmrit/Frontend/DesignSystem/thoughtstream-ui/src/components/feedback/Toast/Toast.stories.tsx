import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toast, ToastProvider, useToast, ToastPlacement } from './Toast';
import { Button } from '../../actions/Button';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast (Toasty)',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const AllVariants: Story = {
  render: () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '380px' }}>
        <Toast
          variant="neutral"
          title="Monograph Synchronized"
          description="Your drafted essay has been securely committed to local storage."
          onClose={() => {}}
        />

        <Toast
          variant="info"
          title="Archive Index Updated"
          description="A new editorial annotation is now available in chapter 4."
          onClose={() => {}}
        />

        <Toast
          variant="success"
          title="Publication Succeeded"
          description="The manuscript was compiled and dispatched to subscribers."
          action={{
            label: 'View',
            onClick: () => alert('View clicked!'),
          }}
          onClose={() => {}}
        />

        <Toast
          variant="warning"
          title="Low Atmospheric Contrast"
          description="Selected theme settings may decrease typography legibility on e-ink readers."
          onClose={() => {}}
        />

        <Toast
          variant="error"
          title="Network Connection Severed"
          description="Unable to sync revision history with the remote repository."
          action={{
            label: 'Retry',
            onClick: () => alert('Retry clicked!'),
          }}
          onClose={() => {}}
        />
      </div>
    );
  },
};

const ToastTriggerDemo = () => {
  const { toast } = useToast();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <Button
        variant="secondary"
        onClick={() =>
          toast.success(
            'Saved to Drafts',
            'Changes will persist offline until reconnecting.'
          )
        }
      >
        Trigger Success
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          toast.info(
            'New Footnote Found',
            'Referenced index citation added to your bibliography.'
          )
        }
      >
        Trigger Info
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          toast.warning(
            'Unsaved Annotations',
            'Closing this reading pane may discard pending margin notes.'
          )
        }
      >
        Trigger Warning
      </Button>

      <Button
        variant="destructive"
        onClick={() =>
          toast.error(
            'Publishing Halted',
            'Manuscript violates minimum margin guidelines.',
            {
              action: {
                label: 'Details',
                onClick: () => alert('Details action clicked!'),
              },
            }
          )
        }
      >
        Trigger Error
      </Button>
    </div>
  );
};

export const InteractiveProvider: Story = {
  render: () => {
    const [placement, setPlacement] = useState<ToastPlacement>('bottom-right');

    return (
      <ToastProvider placement={placement} defaultDuration={4000}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
              Toast Placement:
            </span>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as ToastPlacement)}
              style={{
                padding: '6px 10px',
                border: '1px solid var(--ts-border-medium)',
                borderRadius: '0px',
                background: 'var(--ts-color-bg)',
                color: 'var(--ts-color-text-primary)',
                fontFamily: 'var(--ts-font-body)',
              }}
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
            </select>
          </div>

          <ToastTriggerDemo />
        </div>
      </ToastProvider>
    );
  },
};
