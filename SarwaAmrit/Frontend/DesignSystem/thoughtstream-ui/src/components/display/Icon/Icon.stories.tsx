import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { MATERIAL_ICON_NAMES } from './materialIconNames';

const meta: Meta<typeof Icon> = {
  title: 'Foundations/Icons',
  component: Icon,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Material Symbols (Material Design) icons. Pass the official ligature `name` (snake_case). Supports outlined, rounded, and sharp variants plus fill/weight.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: MATERIAL_ICON_NAMES,
      description: 'Material Symbols ligature name',
    },
    variant: {
      control: 'select',
      options: ['outlined', 'rounded', 'sharp'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    filled: { control: 'boolean' },
    weight: {
      control: 'select',
      options: [100, 200, 300, 400, 500, 600, 700],
    },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    name: 'home',
    variant: 'outlined',
    size: 'medium',
    filled: false,
    weight: 400,
    label: 'Home',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Icon name="favorite" size="small" label="Small" />
      <Icon name="favorite" size="medium" label="Medium" />
      <Icon name="favorite" size="large" label="Large" />
      <Icon name="favorite" size={48} label="48px" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      {(['outlined', 'rounded', 'sharp'] as const).map((variant) => (
        <div key={variant} style={{ textAlign: 'center' }}>
          <Icon name="settings" variant={variant} size="large" label={variant} />
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>{variant}</div>
        </div>
      ))}
    </div>
  ),
};

export const FilledVsOutline: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <div style={{ textAlign: 'center' }}>
        <Icon name="star" size="large" filled={false} label="Outline" />
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>outline</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon name="star" size="large" filled label="Filled" />
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>filled</div>
      </div>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      {([100, 300, 400, 500, 700] as const).map((weight) => (
        <div key={weight} style={{ textAlign: 'center' }}>
          <Icon name="palette" size="large" weight={weight} label={`Weight ${weight}`} />
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>{weight}</div>
        </div>
      ))}
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--ts-font-body)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Icon name="mail" size="small" />
        Messages
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Icon name="notifications" size="small" />
        Notifications
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ts-color-primary, #1a1a1a)' }}>
        <Icon name="check_circle" size="small" filled />
        Verified author
      </span>
    </div>
  ),
};

function IconGallery() {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MATERIAL_ICON_NAMES;
    return MATERIAL_ICON_NAMES.filter((name) => name.includes(q));
  }, [query]);

  const copyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(name);
      window.setTimeout(() => setCopied((current) => (current === name ? null : current)), 1200);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  return (
    <div style={{ width: 'min(960px, 100%)', fontFamily: 'var(--ts-font-body, Inter, sans-serif)' }}>
      <div style={{ marginBottom: 20 }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter Material icons…"
          aria-label="Filter Material icons"
          style={{
            width: '100%',
            maxWidth: 360,
            padding: '10px 12px',
            border: '1px solid var(--ts-border-medium, #d4d4d4)',
            borderRadius: 0,
            background: 'var(--ts-color-surface, #fff)',
            color: 'inherit',
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
          {filtered.length} icon{filtered.length === 1 ? '' : 's'}
          {copied ? ` · copied “${copied}”` : ' · click to copy name'}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))',
          gap: 8,
        }}
      >
        {filtered.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => copyName(name)}
            title={`Copy “${name}”`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '16px 8px',
              border: '1px solid var(--ts-border-subtle, #e7e5e4)',
              borderRadius: 0,
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            <Icon name={name} size={28} />
            <span
              style={{
                fontSize: 11,
                lineHeight: 1.3,
                textAlign: 'center',
                wordBreak: 'break-word',
                opacity: 0.75,
              }}
            >
              {name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const Gallery: Story = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Browse curated Material Design Symbols. Click a tile to copy the ligature name for use with `<Icon name="…" />`.',
      },
    },
  },
  render: () => <IconGallery />,
};
