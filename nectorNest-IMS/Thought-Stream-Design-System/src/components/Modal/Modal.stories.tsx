import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Modal, ModalBody, ModalFooter } from './Modal';
import { Button } from '../Button';
import { Typography } from '../Typography';
import { Input } from '../Input';
import { Trash2 } from 'lucide-react';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Contemplative Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Archive Publication"
          subtitle="MONOGRAPH VOLUME IV • ESSAYS ON CRAFT"
        >
          <ModalBody>
            <Typography variant="body">
              Are you certain you wish to archive this publication? Once moved to archival storage,
              the document will be preserved with a permanent read-only slug and frozen typography tokens.
            </Typography>
            <div style={{ marginTop: '16px' }}>
              <Input
                label="Confirm publication title"
                placeholder="Type 'Essays on Craft' to confirm"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsOpen(false)} leftIcon={<Trash2 size={16} />}>
              Archive Permanently
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

export const SmallConfirmation: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="secondary" onClick={() => setIsOpen(true)}>
          Delete Draft
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          size="small"
          title="Discard Draft?"
        >
          <ModalBody>
            <Typography variant="bodySmall">
              Unpublished edits in your local scratchpad will be permanently discarded. This action
              cannot be undone.
            </Typography>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" size="small" onClick={() => setIsOpen(false)}>
              Keep Editing
            </Button>
            <Button variant="destructive" size="small" onClick={() => setIsOpen(false)}>
              Discard
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};
