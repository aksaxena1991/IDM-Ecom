import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, CheckboxGroup } from './Checkbox';

const meta: Meta<typeof Checkbox> = { title: 'Actions/Checkbox', component: Checkbox, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = { args: { label: 'Keep score locally' } };
export const Group: Story = {
  render: () => (
    <CheckboxGroup label="Bonuses" defaultValue={['flip7']}>
      <Checkbox value="flip7" label="Flip7 bonus" />
      <Checkbox value="first" label="First player" />
    </CheckboxGroup>
  ),
};
