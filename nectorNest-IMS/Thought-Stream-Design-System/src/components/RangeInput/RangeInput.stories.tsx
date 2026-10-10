import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RangeInput } from './RangeInput';

const meta: Meta<typeof RangeInput> = {
  title: 'Components/RangeInput',
  component: RangeInput,
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
type Story = StoryObj<typeof RangeInput>;

export const Default: Story = {
  render: () => {
    const [val, setVal] = useState(680);

    return (
      <RangeInput
        label="Editorial Reading Measure"
        min={480}
        max={840}
        step={20}
        value={val}
        onChange={setVal}
        valueFormat={(v) => `${v}px`}
        helperText="ThoughtStream recommends a maximum 680px measure for optimal line return."
        marks={[
          { value: 480, label: '480px' },
          { value: 680, label: '680px (Optimum)' },
          { value: 840, label: '840px' },
        ]}
      />
    );
  },
};

export const LineHeightControl: Story = {
  render: () => {
    const [lineHeight, setLineHeight] = useState(1.8);

    return (
      <RangeInput
        label="Typographic Line Height"
        min={1.2}
        max={2.4}
        step={0.05}
        value={lineHeight}
        onChange={setLineHeight}
        valueFormat={(v) => `${v.toFixed(2)}`}
        helperText="Calibrate vertical rhythm across body copy."
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <RangeInput
      label="Fixed Font Scale Multiplier"
      min={1}
      max={3}
      defaultValue={1.5}
      disabled
      helperText="This setting is locked by publisher policy."
    />
  ),
};
