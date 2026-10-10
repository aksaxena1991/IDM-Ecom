import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Multiselect } from './Multiselect';

const meta: Meta<typeof Multiselect> = {
  title: 'Components/Multiselect',
  component: Multiselect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '440px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

const topicsList = [
  { value: 'stoicism', label: 'Stoic Philosophy' },
  { value: 'typography', label: 'Baskerville & Typography' },
  { value: 'minimalism', label: 'Minimalist Architecture' },
  { value: 'craft', label: 'Japanese Woodcraft' },
  { value: 'stillness', label: 'Stillness & Solitude' },
  { value: 'nature', label: 'Botanical Observation' },
  { value: 'epistolary', label: 'Epistolary Letters' },
];

export const Default: StoryObj = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['stoicism', 'typography']);
    return (
      <Multiselect
        label="Select Topic Tags"
        placeholder="Choose tags for this essay..."
        helperText="Readers can discover related monographs via these taxonomy tags."
        options={topicsList}
        value={selected}
        onChange={setSelected}
        searchable
        clearable
      />
    );
  },
};

export const EmptyState: StoryObj = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <Multiselect
        label="Editorial Categories"
        placeholder="Pick one or more categories..."
        options={topicsList}
        value={selected}
        onChange={setSelected}
      />
    );
  },
};

export const ErrorValidation: StoryObj = {
  render: () => (
    <Multiselect
      label="Required Categories"
      options={topicsList}
      defaultValue={[]}
      required
      error="At least one category tag is required before publishing."
    />
  ),
};

export const Disabled: StoryObj = {
  render: () => (
    <Multiselect
      label="Archived Tags (Read-only)"
      options={topicsList}
      defaultValue={['stoicism', 'craft']}
      disabled
      helperText="Tags cannot be modified for archived entries."
    />
  ),
};
