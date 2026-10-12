import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
const meta: Meta<typeof Sidebar> = { title: 'Navigation/Sidebar', component: Sidebar, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Sidebar>;
export const Default: Story = {
  render: function Demo() {
    const [value, setValue] = useState('score');
    return (
      <Sidebar
        title="Flip7"
        value={value}
        onChange={setValue}
        items={[
          { id: 'score', label: 'Score' },
          { id: 'standings', label: 'Standings' },
          { id: 'rules', label: 'Rules' },
        ]}
      />
    );
  },
};
