import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter } from './Card';
import { Button } from '../Button';
import { ArrowRight, BookOpen } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card variant="default">
      <CardHeader>
        <CardTitle>On Silence and Creative Space</CardTitle>
        <CardSubtitle>OCTOBER 2026 • 6 MIN READ</CardSubtitle>
      </CardHeader>
      <CardBody>
        The mind requires open horizons to synthesize deep observations. When we eliminate the
        unnecessary noise of hyperactive interfaces, thoughts find their natural rhythm.
      </CardBody>
      <CardFooter>
        <span style={{ fontSize: '13px', color: '#57534E' }}>ThoughtStream Edition #14</span>
        <Button variant="ghost" size="small" rightIcon={<ArrowRight size={14} />}>
          Read Entry
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated">
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <BookOpen size={18} color="#78716C" />
          <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: '#78716C' }}>
            Featured Essay
          </span>
        </div>
        <CardTitle>The Craft of Clear Writing</CardTitle>
        <CardSubtitle>SEPTEMBER 2026 • ESSAY</CardSubtitle>
      </CardHeader>
      <CardBody>
        Writing with discipline means choosing words with the same exactitude that an architect
        chooses stone. No decorative excess, no superficial flourishes.
      </CardBody>
      <CardFooter>
        <Button variant="secondary" size="small">
          Explore Series
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card variant="default" interactive onClick={() => alert('Card clicked')}>
      <CardHeader>
        <CardTitle>Interactive Contemplation Card</CardTitle>
        <CardSubtitle>CLICKABLE SURFACE WITH SUBTLE HOVER STATE</CardSubtitle>
      </CardHeader>
      <CardBody>
        Notice how hover gently enhances the border to #D6D3D1 without jarring motion, shadows, or
        color flashes.
      </CardBody>
    </Card>
  ),
};
