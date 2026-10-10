import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimePicker } from './TimePicker';

const meta: Meta<typeof TimePicker> = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default12Hour: Story = {
  render: () => {
    const [time, setTime] = useState<string | null>('09:30 AM');
    return (
      <div style={{ width: '300px' }}>
        <TimePicker
          label="Morning Reading Slot"
          value={time}
          onChange={setTime}
          helperText="Select a focus session start time."
        />
      </div>
    );
  },
};

export const Format24Hour: Story = {
  render: () => {
    const [time, setTime] = useState<string | null>('14:45');
    return (
      <div style={{ width: '300px' }}>
        <TimePicker
          label="Server Batch Sync (24h)"
          format="24h"
          minuteStep={15}
          value={time}
          onChange={setTime}
          helperText="24-hour military notation with 15-minute intervals."
        />
      </div>
    );
  },
};

export const WithQuickPresets: Story = {
  render: () => {
    const [time, setTime] = useState<string | null>(null);

    const presets = [
      { label: '09:00 AM', value: '09:00 AM' },
      { label: '12:00 PM', value: '12:00 PM' },
      { label: '03:30 PM', value: '03:30 PM' },
      { label: '06:00 PM', value: '06:00 PM' },
    ];

    return (
      <div style={{ width: '300px' }}>
        <TimePicker
          label="Editorial Standup"
          placeholder="Pick meeting hour"
          presets={presets}
          value={time}
          onChange={setTime}
          helperText="Fast shortcuts or column selection."
        />
      </div>
    );
  },
};

export const InlineMode: Story = {
  render: () => {
    const [time, setTime] = useState<string | null>('10:00 AM');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TimePicker
          inline
          label="Quiet Hours Window"
          value={time}
          onChange={setTime}
          helperText="Directly embedded time picker."
        />
        <div style={{ fontSize: '13px', fontFamily: 'var(--ts-font-mono)', color: 'var(--ts-color-text-secondary)' }}>
          Selected time: {time || 'None'}
        </div>
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    return (
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <TimePicker
          label="Required Timestamp"
          required
          placeholder="Mandatory time selection"
        />

        <TimePicker
          label="Validation Error"
          error="Selected time conflicts with an existing focus block."
          defaultValue="02:30 PM"
        />

        <TimePicker
          label="Disabled Picker"
          disabled
          defaultValue="11:00 AM"
        />
      </div>
    );
  },
};
