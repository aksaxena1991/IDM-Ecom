import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioButton, RadioGroup } from './RadioButton';

const meta: Meta<typeof RadioButton> = { title: 'Actions/RadioButton', component: RadioButton, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof RadioButton>;

export const Group: Story = {
  render: () => (
    <RadioGroup label="Round mode" defaultValue="classic">
      <RadioButton value="classic" label="Classic" />
      <RadioButton value="blitz" label="Blitz" />
    </RadioGroup>
  ),
};
