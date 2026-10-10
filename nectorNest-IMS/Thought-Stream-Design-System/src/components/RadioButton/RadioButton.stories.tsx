import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioButton, RadioGroup } from './RadioButton';

const meta: Meta<typeof RadioButton> = {
  title: 'Components/RadioButton',
  component: RadioButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioButton>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState('daily');
    return (
      <RadioGroup
        label="Editorial Cadence (Vertical Alignment)"
        orientation="vertical"
        value={selected}
        onChange={setSelected}
        helperText="Vertical spacing calibrated to 12px rhythm."
      >
        <RadioButton
          value="daily"
          label="Daily Meditation Note"
          description="A short, single paragraph contemplative note each morning."
        />
        <RadioButton
          value="weekly"
          label="Weekly Long-Form Monograph"
          description="In-depth, 2,500-word critical exploration every weekend."
        />
        <RadioButton
          value="monthly"
          label="Monthly Archival Folio"
          description="Curated prints and literary essays."
        />
      </RadioGroup>
    );
  },
};

export const HorizontalAlignment: Story = {
  render: () => {
    const [themePreference, setThemePreference] = useState('paper');
    return (
      <RadioGroup
        label="Surface Tone (Horizontal Alignment)"
        orientation="horizontal"
        value={themePreference}
        onChange={setThemePreference}
        helperText="Items aligned horizontally with 24px spacing."
      >
        <RadioButton value="paper" label="Warm Paper (#FAFAF9)" />
        <RadioButton value="stone" label="Quiet Stone (#F5F5F4)" />
        <RadioButton value="night" label="Nocturnal (#1C1917)" />
      </RadioGroup>
    );
  },
};

export const AlignmentComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '440px' }}>
      <RadioButton
        name="compare"
        align="start"
        defaultChecked
        label="Start-aligned Radio Button (Top)"
        description="With long multi-line text, the radio circle sits neatly at the top alongside the first line of typography."
      />
      <RadioButton
        name="compare"
        align="center"
        label="Center-aligned Radio Button"
        description="The radio button aligns vertically to the center of the text block."
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <RadioButton name="group" label="Disabled unchecked" disabled />
      <RadioButton name="group" label="Disabled checked" disabled checked />
    </div>
  ),
};
