import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover';
import { Button } from '../../actions/Button';
import { Typography } from '../../typography/Typography';
import { Input } from '../../actions/Input';
import { Checkbox } from '../../actions/Checkbox';
import { SlidersHorizontal, Settings } from 'lucide-react';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const FilterPopover: StoryObj = {
  render: () => (
    <Popover
      placement="bottom-start"
      style={{ width: '280px' }}
      trigger={
        <Button variant="secondary" leftIcon={<SlidersHorizontal size={16} />}>
          Filter Essays
        </Button>
      }
      content={({ close }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Typography variant="overline" color="brand">Reading Preferences</Typography>
          <Checkbox label="Only show long-form essays" defaultChecked />
          <Checkbox label="Include archived monographs" />
          <Checkbox label="Audio edition available" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <Button variant="ghost" size="small" onClick={close}>Reset</Button>
            <Button variant="primary" size="small" onClick={close}>Apply Filter</Button>
          </div>
        </div>
      )}
    />
  ),
};

export const QuickSettings: StoryObj = {
  render: () => (
    <Popover
      placement="bottom-end"
      style={{ width: '320px' }}
      trigger={
        <Button variant="ghost" leftIcon={<Settings size={16} />}>
          Settings
        </Button>
      }
      content={({ close }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Typography variant="subhead" style={{ margin: 0, fontSize: '18px' }}>Reading Display</Typography>
            <Typography variant="caption" color="secondary">Calibrate typographic focus measure</Typography>
          </div>
          <Input label="Max Measure (px)" defaultValue="680" helperText="Default optimal reading measure is 680px" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button size="small" variant="secondary" onClick={close}>Done</Button>
          </div>
        </div>
      )}
    />
  ),
};
