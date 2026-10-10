import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DateRangePicker, DateRange } from './DateRangePicker';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
  render: () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 10);

    const [range, setRange] = useState<DateRange>({
      start: today,
      end: nextWeek,
    });

    return (
      <div style={{ width: '380px' }}>
        <DateRangePicker
          label="Research Fellowship Term"
          value={range}
          onChange={setRange}
          helperText="Select beginning and concluding dates."
        />
      </div>
    );
  },
};

export const InlineDualMonth: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>({
      start: null,
      end: null,
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <DateRangePicker
          inline
          label="Archival Grant Period"
          value={range}
          onChange={setRange}
          helperText="Select two-month exploration boundaries."
        />
        <div style={{ fontSize: '13px', fontFamily: 'var(--ts-font-mono)', color: 'var(--ts-color-text-secondary)' }}>
          Start: {range.start ? range.start.toDateString() : 'None'} | End:{' '}
          {range.end ? range.end.toDateString() : 'None'}
        </div>
      </div>
    );
  },
};

export const CustomPresets: Story = {
  render: () => {
    const today = new Date();
    const springStart = new Date(today.getFullYear(), 2, 20);
    const summerStart = new Date(today.getFullYear(), 5, 21);

    const presets = [
      {
        label: 'Q1 Review',
        range: {
          start: new Date(today.getFullYear(), 0, 1),
          end: new Date(today.getFullYear(), 2, 31),
        },
      },
      {
        label: 'Spring Cohort',
        range: {
          start: springStart,
          end: summerStart,
        },
      },
    ];

    const [range, setRange] = useState<DateRange>({
      start: null,
      end: null,
    });

    return (
      <div style={{ width: '380px' }}>
        <DateRangePicker
          label="Academic Residency Window"
          placeholder="Choose residency schedule"
          presets={presets}
          value={range}
          onChange={setRange}
          helperText="Choose an editorial period preset or select from calendar."
        />
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + 7);

    return (
      <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <DateRangePicker
          label="Required Cohort Range"
          required
          placeholder="Mandatory date range"
        />

        <DateRangePicker
          label="Moratorium Conflict"
          error="Selected range overlaps with seasonal press embargo."
          defaultValue={{ start: today, end }}
        />

        <DateRangePicker
          label="Archived Scope"
          disabled
          defaultValue={{ start: today, end }}
        />
      </div>
    );
  },
};
