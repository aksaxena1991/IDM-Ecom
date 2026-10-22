import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BigFriendlyButton } from '../../actions/BigFriendlyButton/BigFriendlyButton.js';
import { Modal } from './Modal.js';

const meta: Meta<typeof Modal> = {
  title: 'SkyLearn/Modal',
  component: Modal,
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <BigFriendlyButton onClick={() => setOpen(true)}>Open modal</BigFriendlyButton>
        <Modal
          open={open}
          title="Take a short break?"
          onClose={() => setOpen(false)}
          footer={<BigFriendlyButton onClick={() => setOpen(false)}>Keep going!</BigFriendlyButton>}
        >
          You&apos;ve been reading for 12 minutes. Stretch your fingers, then come back when you&apos;re ready.
        </Modal>
      </>
    );
  },
};
