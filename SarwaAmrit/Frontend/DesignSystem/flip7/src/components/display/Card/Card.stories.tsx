import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardTitle, CardSubtitle, CardBody } from './Card';
const meta: Meta<typeof Card> = { title: 'Display/Card', component: Card, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Card>;
export const Default: Story = {
  render: () => (
    <Card style={{ width: 280 }}>
      <CardTitle>Round recap</CardTitle>
      <CardSubtitle>Table of 4</CardSubtitle>
      <CardBody>Maya flipped seven unique numbers.</CardBody>
    </Card>
  ),
};
