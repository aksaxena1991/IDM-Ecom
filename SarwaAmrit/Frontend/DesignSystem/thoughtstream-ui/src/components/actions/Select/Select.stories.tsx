import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';
import { BookOpen, Globe, Feather, Bookmark } from 'lucide-react';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

const cadenceOptions = [
  { value: 'daily', label: 'Daily Morning Dispatch (300 words)', icon: <Feather size={15} /> },
  { value: 'weekly', label: 'Weekly Sunday Monograph (2,000 words)', icon: <BookOpen size={15} /> },
  { value: 'monthly', label: 'Monthly Retrospective (Print Edition)', icon: <Bookmark size={15} /> },
  { value: 'archival', label: 'Archival Letter (Once Annually)', icon: <Globe size={15} /> },
];

export const Default: StoryObj = {
  render: () => {
    const [val, setVal] = useState('weekly');
    return (
      <Select
        label="Publication Cadence"
        helperText="Choose how frequently essays should arrive in your reader's mailbox."
        options={cadenceOptions}
        value={val}
        onChange={setVal}
        clearable
      />
    );
  },
};

export const Searchable: StoryObj = {
  render: () => {
    const [val, setVal] = useState('');
    return (
      <Select
        label="Topic Taxonomy"
        placeholder="Filter through topics..."
        searchable
        options={[
          { value: 'epictetus', label: 'Stoic Ethics (Epictetus & Seneca)' },
          { value: 'typography', label: 'Print Typography & Baskerville History' },
          { value: 'architecture', label: 'Brutalist Architecture & Stillness' },
          { value: 'solitude', label: 'Essays on Solitude & Deep Focus' },
          { value: 'craft', label: 'Japanese Woodworking & Craft Restraint' },
        ]}
        value={val}
        onChange={setVal}
      />
    );
  },
};

export const ErrorState: StoryObj = {
  render: () => (
    <Select
      label="Language Selection"
      options={cadenceOptions}
      error="Please select a language edition before proceeding."
    />
  ),
};

export const Disabled: StoryObj = {
  render: () => (
    <Select
      label="Locked Archive Section"
      options={cadenceOptions}
      defaultValue="monthly"
      disabled
      helperText="This publication tier is locked."
    />
  ),
};
