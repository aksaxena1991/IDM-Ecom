import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | null>(new Date());
    return (
      <div style={{ width: '320px' }}>
        <DatePicker
          label="Publication Date"
          value={selected}
          onChange={setSelected}
          helperText="Select the date of monograph release."
        />
      </div>
    );
  },
};

export const WithPresets: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | null>(null);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const presets = [
      { label: 'Today', date: today },
      { label: 'Tomorrow', date: tomorrow },
      { label: 'Next Week', date: nextWeek },
    ];

    return (
      <div style={{ width: '320px' }}>
        <DatePicker
          label="Editorial Review Date"
          placeholder="Pick review target"
          value={selected}
          onChange={setSelected}
          presets={presets}
          helperText="Choose a quick preset or pick from the calendar."
        />
      </div>
    );
  },
};

export const InlineCalendarMode: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date());
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <DatePicker
          inline
          label="Archival Release Schedule"
          value={date}
          onChange={setDate}
          helperText="Embedded calendar mode for dashboard panels."
        />
        <div style={{ fontSize: '13px', fontFamily: 'var(--ts-font-mono)', color: 'var(--ts-color-text-secondary)' }}>
          Selected: {date ? date.toDateString() : 'None'}
        </div>
      </div>
    );
  },
};

export const MinMaxRestricted: Story = {
  render: () => {
    const today = new Date();
    const min = new Date(today.getFullYear(), today.getMonth(), 5);
    const max = new Date(today.getFullYear(), today.getMonth(), 24);

    return (
      <div style={{ width: '320px' }}>
        <DatePicker
          label="Embargo Range (5th to 24th)"
          minDate={min}
          maxDate={max}
          placeholder="Select permissible date"
          helperText="Dates outside the window are disabled."
        />
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    return (
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <DatePicker
          label="Required Field"
          required
          placeholder="Mandatory date selection"
        />

        <DatePicker
          label="Validation Error"
          error="Selected date falls on a restricted archival moratorium."
          defaultValue={new Date()}
        />

        <DatePicker
          label="Disabled Field"
          disabled
          defaultValue={new Date()}
        />
      </div>
    );
  },
};
