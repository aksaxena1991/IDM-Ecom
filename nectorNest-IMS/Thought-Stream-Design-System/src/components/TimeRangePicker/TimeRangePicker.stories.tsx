import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimeRangePicker, TimeRange } from './TimeRangePicker';

const meta: Meta<typeof TimeRangePicker> = {
  title: 'Components/TimeRangePicker',
  component: TimeRangePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimeRangePicker>;

export const Default12Hour: Story = {
  render: () => {
    const [range, setRange] = useState<TimeRange>({
      start: '09:00 AM',
      end: '05:00 PM',
    });

    return (
      <div style={{ width: '360px' }}>
        <TimeRangePicker
          label="Contemplative Deep Work Block"
          value={range}
          onChange={setRange}
          helperText="Dual column picker with 15-minute resolution."
        />
      </div>
    );
  },
};

export const Format24Hour: Story = {
  render: () => {
    const [range, setRange] = useState<TimeRange>({
      start: '08:30',
      end: '16:30',
    });

    return (
      <div style={{ width: '360px' }}>
        <TimeRangePicker
          label="Broadcast Window (24h)"
          format="24h"
          minuteStep={30}
          value={range}
          onChange={setRange}
          helperText="24-hour military notation with 30-minute intervals."
        />
      </div>
    );
  },
};

export const InlineMode: Story = {
  render: () => {
    const [range, setRange] = useState<TimeRange>({
      start: '10:00 AM',
      end: '01:00 PM',
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TimeRangePicker
          inline
          label="Distraction-Free Reading Window"
          value={range}
          onChange={setRange}
          helperText="Embedded selector for workspace preferences."
        />
        <div style={{ fontSize: '13px', fontFamily: 'var(--ts-font-mono)', color: 'var(--ts-color-text-secondary)' }}>
          Selected: {range.start || '--'} → {range.end || '--'}
        </div>
      </div>
    );
  },
};

export const CustomPresets: Story = {
  render: () => {
    const presets = [
      { label: 'Pomodoro (25m)', range: { start: '09:00 AM', end: '09:25 AM' } },
      { label: 'Writing Block (2h)', range: { start: '10:00 AM', end: '12:00 PM' } },
      { label: 'Evening Meditation', range: { start: '08:00 PM', end: '09:00 PM' } },
    ];

    const [range, setRange] = useState<TimeRange>({
      start: null,
      end: null,
    });

    return (
      <div style={{ width: '360px' }}>
        <TimeRangePicker
          label="Session Preset Scheduler"
          placeholder="Pick quick session"
          presets={presets}
          value={range}
          onChange={setRange}
          helperText="Quick focus session presets."
        />
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    return (
      <div style={{ width: '360px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <TimeRangePicker
          label="Required Working Interval"
          required
          placeholder="Mandatory interval"
        />

        <TimeRangePicker
          label="Schedule Overlap"
          error="Interval conflicts with recurring silent seminar."
          defaultValue={{ start: '02:00 PM', end: '04:00 PM' }}
        />

        <TimeRangePicker
          label="Locked Slot"
          disabled
          defaultValue={{ start: '09:00 AM', end: '11:00 AM' }}
        />
      </div>
    );
  },
};
