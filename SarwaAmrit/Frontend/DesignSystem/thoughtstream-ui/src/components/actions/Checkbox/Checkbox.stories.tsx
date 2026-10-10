import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, CheckboxGroup } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Checkbox
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        label="Send weekly digest of contemplative writings"
        description="Delivered every Sunday at sunrise with zero spam."
      />
    );
  },
};

export const AlignmentComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '440px' }}>
      <Checkbox
        align="start"
        defaultChecked
        label="Start-aligned Checkbox (Top)"
        description="With multi-line text, the 18px checkbox box anchors cleanly to the first line of typography, adhering to literary reading rhythm."
      />
      <Checkbox
        align="center"
        label="Center-aligned Checkbox"
        description="The checkbox aligns vertically with the middle of the label content block."
      />
    </div>
  ),
};

export const HorizontalAlignmentGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['essays', 'poetry']);

    return (
      <CheckboxGroup
        label="Notification Channels (Horizontal Layout)"
        orientation="horizontal"
        value={selected}
        onChange={setSelected}
        helperText="Items aligned horizontally with calm 24px spacing."
      >
        <Checkbox value="essays" label="Essays" />
        <Checkbox value="poetry" label="Poetry" />
        <Checkbox value="monographs" label="Monographs" />
        <Checkbox value="audio" label="Audio Dispatches" />
      </CheckboxGroup>
    );
  },
};

export const VerticalAlignmentGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['weekly']);

    return (
      <CheckboxGroup
        label="Distribution Cadence (Vertical Layout)"
        orientation="vertical"
        value={selected}
        onChange={setSelected}
        helperText="Items aligned vertically with 12px base rhythm."
      >
        <Checkbox
          value="daily"
          label="Daily Meditation Note"
          description="A short single-paragraph reflection each morning."
        />
        <Checkbox
          value="weekly"
          label="Weekly Sunday Monograph"
          description="In-depth, 2,000-word critical exploration every weekend."
        />
        <Checkbox
          value="monthly"
          label="Monthly Archival Gazette"
          description="Print and typography collection."
        />
      </CheckboxGroup>
    );
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Checkbox label="Unchecked by default" />
      <Checkbox label="Checked item" defaultChecked />
      <Checkbox label="Indeterminate selection" indeterminate />
      <Checkbox label="Disabled option" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </div>
  ),
};
