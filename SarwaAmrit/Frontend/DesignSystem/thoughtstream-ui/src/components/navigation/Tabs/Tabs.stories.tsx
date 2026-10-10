import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabList, Tab, TabPanel, type TabItem } from './Tabs';
import { BookOpen, Sparkles, Feather, Settings, Layers, Code, Bookmark } from 'lucide-react';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Tab layout orientation: horizontal row or vertical column',
    },
    variant: {
      control: 'select',
      options: ['line', 'enclosed', 'subtle', 'pills'],
      description: 'Visual indicator and frame style',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Scale sizing of tabs',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretches horizontal tabs to fill 100% container width',
    },
    onValueChange: { action: 'tabChanged' },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const sampleItems: TabItem[] = [
  {
    id: 'manuscripts',
    label: 'Manuscripts',
    icon: <BookOpen size={16} />,
    badge: '14',
    content: (
      <div>
        <h3 style={{ fontFamily: 'var(--ts-font-heading)', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
          Recent Manuscripts
        </h3>
        <p style={{ margin: 0, color: 'var(--ts-color-text-secondary)', lineHeight: 1.6 }}>
          Explore distilled architectural treatises, contemplative essays, and draft reflections
          cataloged across the last lunar cycle.
        </p>
      </div>
    ),
  },
  {
    id: 'fragments',
    label: 'Thought Fragments',
    icon: <Sparkles size={16} />,
    badge: '8',
    content: (
      <div>
        <h3 style={{ fontFamily: 'var(--ts-font-heading)', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
          Transient Ideations
        </h3>
        <p style={{ margin: 0, color: 'var(--ts-color-text-secondary)', lineHeight: 1.6 }}>
          Ephemeral thoughts recorded mid-stride. Unformatted, unadorned, awaiting contemplative synthesis.
        </p>
      </div>
    ),
  },
  {
    id: 'taxonomy',
    label: 'Taxonomy',
    icon: <Layers size={16} />,
    content: (
      <div>
        <h3 style={{ fontFamily: 'var(--ts-font-heading)', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
          Structural Classification
        </h3>
        <p style={{ margin: 0, color: 'var(--ts-color-text-secondary)', lineHeight: 1.6 }}>
          Ontological trees organizing nodes into categories, domains, and relationship matrices.
        </p>
      </div>
    ),
  },
  {
    id: 'settings',
    label: 'Preferences',
    icon: <Settings size={16} />,
    content: (
      <div>
        <h3 style={{ fontFamily: 'var(--ts-font-heading)', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
          Reading & Writing Environment
        </h3>
        <p style={{ margin: 0, color: 'var(--ts-color-text-secondary)', lineHeight: 1.6 }}>
          Configure measure line-length (optimal 65ch), monospace telemetry, and dark contemplation mode.
        </p>
      </div>
    ),
  },
];

/**
 * Horizontal Line Tabs (Default)
 */
export const Horizontal: Story = {
  args: {
    items: sampleItems,
    orientation: 'horizontal',
    variant: 'line',
    size: 'md',
    fullWidth: false,
  },
  render: (args) => {
    const [val, setVal] = useState('manuscripts');
    return (
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <Tabs
          {...args}
          value={val}
          onValueChange={(nextVal) => {
            setVal(nextVal);
            args.onValueChange?.(nextVal);
          }}
        />
      </div>
    );
  },
};

/**
 * Vertical Tabs with Rich Panels
 */
export const Vertical: Story = {
  args: {
    items: sampleItems,
    orientation: 'vertical',
    variant: 'line',
    size: 'md',
  },
  render: (args) => {
    const [val, setVal] = useState('manuscripts');
    return (
      <div style={{ maxWidth: 840, margin: '0 auto', border: '1px solid var(--ts-border-subtle)', padding: 24, background: 'var(--ts-color-bg)' }}>
        <Tabs
          {...args}
          value={val}
          onValueChange={(nextVal) => {
            setVal(nextVal);
            args.onValueChange?.(nextVal);
          }}
        />
      </div>
    );
  },
};

/**
 * Enclosed Boxed Variant
 */
export const Enclosed: Story = {
  args: {
    items: sampleItems,
    orientation: 'horizontal',
    variant: 'enclosed',
    size: 'md',
  },
  render: (args) => {
    const [val, setVal] = useState('manuscripts');
    return (
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <Tabs
          {...args}
          value={val}
          onValueChange={(nextVal) => {
            setVal(nextVal);
            args.onValueChange?.(nextVal);
          }}
        />
      </div>
    );
  },
};

/**
 * Subtle Background Variant
 */
export const Subtle: Story = {
  args: {
    items: sampleItems,
    orientation: 'horizontal',
    variant: 'subtle',
    size: 'md',
  },
  render: (args) => {
    const [val, setVal] = useState('fragments');
    return (
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <Tabs
          {...args}
          value={val}
          onValueChange={(nextVal) => {
            setVal(nextVal);
            args.onValueChange?.(nextVal);
          }}
        />
      </div>
    );
  },
};

/**
 * Sharp 0px Pills Variant
 */
export const Pills: Story = {
  args: {
    items: sampleItems,
    orientation: 'horizontal',
    variant: 'pills',
    size: 'md',
  },
  render: (args) => {
    const [val, setVal] = useState('taxonomy');
    return (
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <Tabs
          {...args}
          value={val}
          onValueChange={(nextVal) => {
            setVal(nextVal);
            args.onValueChange?.(nextVal);
          }}
        />
      </div>
    );
  },
};

/**
 * Compound Component Composition
 */
export const CompoundComposition: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('code');
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} variant="line">
          <TabList aria-label="Editor View Modes">
            <Tab value="reader" icon={<Feather size={15} />}>
              Reading View
            </Tab>
            <Tab value="code" icon={<Code size={15} />} badge="TS">
              Raw Source
            </Tab>
            <Tab value="bookmarks" icon={<Bookmark size={15} />} badge="3">
              Bookmarks
            </Tab>
          </TabList>

          <TabPanel value="reader">
            <div style={{ padding: '16px 0' }}>
              <p style={{ margin: 0 }}>
                Immersive distraction-free reading typography centered within contemplative margins.
              </p>
            </div>
          </TabPanel>

          <TabPanel value="code">
            <div style={{ padding: '16px 0', fontFamily: 'var(--ts-font-mono)', fontSize: 13, background: 'var(--ts-color-surface)', border: '1px solid var(--ts-border-subtle)', paddingInline: 16 }}>
              <pre style={{ margin: 0 }}>{`// ThoughtStream Component Definition
export const ContemplativeModule = () => {
  return <div className="ts-plane" />;
};`}</pre>
            </div>
          </TabPanel>

          <TabPanel value="bookmarks">
            <div style={{ padding: '16px 0' }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Rule #1: 0px Border Radius</li>
                <li>Rule #2: Flat Plane Architecture</li>
                <li>Rule #3: Contemplative Spacing</li>
              </ul>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    );
  },
};
