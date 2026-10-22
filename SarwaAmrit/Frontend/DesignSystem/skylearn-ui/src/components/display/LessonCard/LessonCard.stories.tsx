import type { Meta, StoryObj } from '@storybook/react-vite';

import { LessonCard } from './LessonCard.js';

const meta: Meta<typeof LessonCard> = {
  title: 'SkyLearn/Lesson Card',
  component: LessonCard,
};

export default meta;

type Story = StoryObj<typeof LessonCard>;

export const InProgress: Story = {
  args: {
    title: 'Multiply with groups',
    description: 'Build equal groups and connect them to multiplication facts.',
    progress: 62,
    icon: '✖️',
  },
};

export const Active: Story = {
  args: {
    title: 'Reading: The river trip',
    description: 'Find the main idea and supporting details.',
    progress: 10,
    active: true,
    icon: '📚',
  },
};

export const Locked: Story = {
  args: {
    title: 'Division stories',
    description: 'Unlock after finishing multiplication.',
    locked: true,
  },
};
