import type { Meta, StoryObj } from '@storybook/react-vite';
import { List, ListItem } from './List';
import { Badge } from '../../display/Badge';

const meta: Meta<typeof List> = {
  title: 'Typography/List',
  component: List,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof List>;

export const Players: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <List>
        <ListItem primaryText="Maya" secondaryText="First player" trailing={<Badge>1st</Badge>} interactive />
        <ListItem primaryText="Riley" secondaryText="12 pts" />
        <ListItem primaryText="Kai" secondaryText="BOOM" trailing={<Badge tone="coral">BOOM</Badge>} />
      </List>
    </div>
  ),
};
