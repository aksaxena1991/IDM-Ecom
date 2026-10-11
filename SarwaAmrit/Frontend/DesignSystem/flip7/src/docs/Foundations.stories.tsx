import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, radii, shadows } from '../tokens/spacing';

const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

const swatchGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 16,
};

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(43,168,162,0.1)' }}>
      <div style={{ height: 72, background: value }} />
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#1E8C86' }}>{name}</div>
        <div style={{ fontSize: 12, color: '#2BA8A2' }}>{value}</div>
      </div>
    </div>
  );
}

export const Colors: Story = {
  render: () => (
    <div style={{ maxWidth: 880 }}>
      <h2 className="f7-type-h2" style={{ marginBottom: 16 }}>Brand</h2>
      <div style={swatchGrid}>
        {Object.entries(colors.brand).map(([name, value]) => (
          <Swatch key={name} name={name} value={value} />
        ))}
      </div>
      <h2 className="f7-type-h2" style={{ margin: '32px 0 16px' }}>Surface & semantic</h2>
      <div style={swatchGrid}>
        {Object.entries({ ...colors.surface, ...colors.semantic }).map(([name, value]) => (
          <Swatch key={name} name={name} value={value} />
        ))}
      </div>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
      {(Object.entries(typography.scale) as [string, { size: string; weight: number; letterSpacing: string }][]).map(
        ([name, token]) => (
          <div key={name} style={{ borderBottom: '3px dashed #3CC4BD', paddingBottom: 12 }}>
            <div className={`f7-type-${name === 'display' ? 'display' : name}`}>{name} — Flip7 feels like a tap</div>
            <div className="f7-type-xs" style={{ color: '#2BA8A2' }}>
              {token.size} · weight {token.weight} · tracking {token.letterSpacing}
            </div>
          </div>
        )
      )}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Object.entries(spacing)
        .filter(([key]) => key !== 'baseUnit')
        .map(([name, value]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, fontWeight: 800, color: '#1E8C86' }}>{name}</div>
            <div style={{ height: 24, width: value.replace('rpx', 'px'), background: '#2BA8A2', borderRadius: 8 }} />
            <div className="f7-type-sm">{value}</div>
          </div>
        ))}
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {Object.entries(radii).map(([name, value]) => (
        <div
          key={name}
          style={{
            width: 96,
            height: 96,
            background: '#FFF8E7',
            border: '3px solid #1E8C86',
            borderRadius: value.replace('rpx', 'px'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#1E8C86',
          }}
        >
          {name}
        </div>
      ))}
    </div>
  ),
};

export const Elevation: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
      {Object.entries(shadows).map(([name, value]) => (
        <div
          key={name}
          style={{
            background: '#fff',
            borderRadius: 24,
            minHeight: 88,
            padding: 16,
            boxShadow: value.replace(/rpx/g, 'px'),
            fontWeight: 800,
            color: '#1E8C86',
          }}
        >
          {name}
        </div>
      ))}
    </div>
  ),
};
