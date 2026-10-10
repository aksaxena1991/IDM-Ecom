import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel } from './Dropdown';
import { Button } from '../Button';
import { MoreHorizontal, Edit3, Copy, Download, Archive, Trash2 } from 'lucide-react';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const PublicationActions: StoryObj = {
  render: () => (
    <Dropdown
      trigger={
        <Button variant="secondary" leftIcon={<MoreHorizontal size={16} />}>
          Essay Options
        </Button>
      }
    >
      <DropdownLabel>Editorial Actions</DropdownLabel>
      <DropdownItem icon={<Edit3 size={15} />} shortcut="⌘E">
        Edit Manuscript
      </DropdownItem>
      <DropdownItem icon={<Copy size={15} />} shortcut="⌘C">
        Duplicate Entry
      </DropdownItem>
      <DropdownItem icon={<Download size={15} />}>
        Export Plaintext (Markdown)
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem icon={<Archive size={15} />}>
        Move to Archive
      </DropdownItem>
      <DropdownItem icon={<Trash2 size={15} />} destructive>
        Delete Permanently
      </DropdownItem>
    </Dropdown>
  ),
};
