import type { Meta, StoryObj } from '@storybook/react-vite';

import { colors, colorsDark } from '../tokens/colors.js';
import { Typography } from '../components/typography/Typography/Typography.js';
import { ThemeProvider } from '../components/theme/ThemeProvider/ThemeProvider.js';
import { LessonCard } from '../components/display/LessonCard/LessonCard.js';

const meta: Meta = {
  title: 'SkyLearn/Foundations',
};

export default meta;

export const ColorPalette: StoryObj = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
    {Object.entries({
      Sky: colors.sky.DEFAULT,
      'Sky Bright': colors.sky.bright,
      'Sky Deep': colors.sky.deep,
      'Sky Soft': colors.sky.soft,
      Sun: colors.sun.DEFAULT,
      Leaf: colors.leaf.DEFAULT,
      Coral: colors.coral.DEFAULT,
      Berry: colors.berry.DEFAULT,
      Ink: colors.ink.DEFAULT,
      Surface: colors.surface.DEFAULT,
    }).map(([name, hex]) => (
      <div key={name}>
        <div
          style={{
            height: 72,
            borderRadius: 12,
            background: hex,
            border: '1px solid #E2E8F0',
          }}
        />
        <Typography variant="caption" style={{ display: 'block', marginTop: 8 }}>
          {name}
          <br />
          {hex}
        </Typography>
      </div>
    ))}
  </div>
);

ColorPalette.storyName = 'Colors';

export const TypeScale: StoryObj = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Typography variant="hero">Hero — explore fractions</Typography>
    <Typography variant="h1">H1 — Your lessons</Typography>
    <Typography variant="h2">H2 — Reading comprehension</Typography>
    <Typography variant="h3">H3 — Chapter 4</Typography>
    <Typography variant="bodyLarge">Body large — What do you notice about this number?</Typography>
    <Typography variant="body">Body — Maya spent 18 minutes on multiplication today.</Typography>
    <Typography variant="small">Small — Last updated 2 hours ago</Typography>
    <Typography variant="score">92</Typography>
  </div>
);

TypeScale.storyName = 'Typography';

export const ElevationAndSpacing: StoryObj = () => (
  <div className="sl-section" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <div
      style={{
        padding: 24,
        borderRadius: 20,
        border: '1px solid #E2E8F0',
        background: '#F8FAFC',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
      }}
    >
      Card hover elevation (1px outline + soft shadow)
    </div>
    <div
      style={{
        padding: 24,
        borderRadius: 20,
        border: '3px solid #3B82F6',
        background: '#FFFFFF',
        boxShadow: '0 12px 32px rgba(59, 130, 246, 0.15)',
      }}
    >
      Active lesson card (3px sky border + sky-soft shadow)
    </div>
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 999,
        background: '#FBBF24',
        boxShadow: '0 0 24px rgba(252, 211, 77, 0.4)',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
      }}
    >
      ★
    </div>
    <Typography variant="small">
      Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px · Section gap 48px · Container max 1280px
    </Typography>
  </div>
);

ElevationAndSpacing.storyName = 'Elevation & spacing';

export const DarkTheme: StoryObj = () => (
  <ThemeProvider defaultColorScheme="dark">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Typography variant="h2">Dark theme</Typography>
      <Typography variant="body">
        Deep navy background with brighter sky/leaf accents. Toggle via Appearance in the Storybook toolbar or{' '}
        <code>defaultColorScheme=&quot;dark&quot;</code>.
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
        {Object.entries({
          Background: colorsDark.surface.background,
          Surface: colorsDark.surface.DEFAULT,
          Elevated: colorsDark.surface.elevated,
          Ink: colorsDark.ink.DEFAULT,
          'Sky soft': colorsDark.sky.soft,
          'Leaf soft': colorsDark.leaf.soft,
        }).map(([name, hex]) => (
          <div key={name}>
            <div
              style={{
                height: 72,
                borderRadius: 12,
                background: hex,
                border: '1px solid var(--sl-color-outline)',
              }}
            />
            <Typography variant="caption" style={{ display: 'block', marginTop: 8 }}>
              {name}
              <br />
              {hex}
            </Typography>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 320 }}>
        <LessonCard
          title="Stars at night"
          description="Count constellations"
          progress={65}
          icon="⭐"
          active
        />
      </div>
    </div>
  </ThemeProvider>
);

DarkTheme.storyName = 'Dark theme';
