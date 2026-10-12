import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from './Modal';
import { Button } from '../../actions/Button';

const meta: Meta<typeof Modal> = { title: 'Overlays/Modal', component: Modal, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="New player">
          <ModalBody>Add someone to the table.</ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Add</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};
