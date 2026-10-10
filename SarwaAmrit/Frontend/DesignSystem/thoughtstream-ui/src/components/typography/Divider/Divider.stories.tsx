import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';
import { Typography } from '../Typography';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <Typography variant="headline">First Section</Typography>
      <Typography variant="body">
        The subtle hairline divider provides quiet rhythm without intruding upon reader concentration.
      </Typography>
      <Divider tone="subtle" spacing="large" />
      <Typography variant="headline">Second Section</Typography>
      <Typography variant="body">
        Section separation is achieved purely through white space and delicate stone hairlines.
      </Typography>
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <Typography variant="caption">Subtle (#E7E5E4)</Typography>
        <Divider tone="subtle" spacing="small" />
      </div>
      <div>
        <Typography variant="caption">Medium (#D6D3D1)</Typography>
        <Divider tone="medium" spacing="small" />
      </div>
      <div>
        <Typography variant="caption">Strong (#A8A29E)</Typography>
        <Divider tone="strong" spacing="small" />
      </div>
    </div>
  ),
};
