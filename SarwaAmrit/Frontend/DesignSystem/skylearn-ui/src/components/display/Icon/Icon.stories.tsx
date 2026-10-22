import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon, type SkyLearnIconName } from './Icon.js';

const names: SkyLearnIconName[] = [
  'book',
  'pencil',
  'calculator',
  'search',
  'lightbulb',
  'star',
  'rocket',
  'leaf',
  'sun',
  'raindrop',
  'palette',
  'alphabet-block',
];

const meta: Meta<typeof Icon> = {
  title: 'SkyLearn/Iconography',
  component: Icon,
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Vocabulary: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 24 }}>
      {names.map((name) => (
        <div key={name} style={{ textAlign: 'center' }}>
          <Icon name={name} size="md" tone="default" />
          <div style={{ marginTop: 8, fontSize: 14, color: '#475569' }}>{name}</div>
        </div>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Icon name="book" size="lg" tone="default" label="Book" />
      <Icon name="book" size="lg" tone="active" label="Active" />
      <Icon name="star" size="lg" tone="achievement" label="Achievement" />
    </div>
  ),
};
