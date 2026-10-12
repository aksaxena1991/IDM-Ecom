import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Typography/Typography',
  component: Typography,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Typography>;

export const Scale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Typography variant="display">Display</Typography>
      <Typography variant="h1">Headline 1</Typography>
      <Typography variant="h2">Headline 2</Typography>
      <Typography variant="h3">Headline 3</Typography>
      <Typography variant="body">Body copy for scores and rules.</Typography>
      <Typography variant="sm">Small helper</Typography>
      <Typography variant="xs" color="coral">BOOM caption</Typography>
    </div>
  ),
};
