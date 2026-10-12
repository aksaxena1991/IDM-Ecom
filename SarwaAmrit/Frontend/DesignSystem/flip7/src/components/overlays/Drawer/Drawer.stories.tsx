import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Drawer } from './Drawer';
import { Button } from '../../actions/Button';
const meta: Meta<typeof Drawer> = { title: 'Overlays/Drawer', component: Drawer, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Drawer>;
export const Default: Story = {
  render: function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Rules</Button>
        <Drawer isOpen={open} onClose={() => setOpen(false)} title="How to play">
          Flip unique numbers. Duplicate is BOOM.
        </Drawer>
      </>
    );
  },
};
