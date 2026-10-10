import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for ThoughtStream components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light Mode' },
          { value: 'dark', icon: 'moon', title: 'Dark Mode' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
    liquidBackdrop: {
      name: 'Liquid Backdrop',
      description: 'Atmospheric backdrop to showcase liquid glass refraction',
      defaultValue: 'aurora',
      toolbar: {
        icon: 'drop',
        items: [
          { value: 'aurora', icon: 'sparkles', title: 'Liquid Aurora (Flowing Lights)' },
          { value: 'prismatic', icon: 'grid', title: 'Liquid Prismatic Mesh' },
          { value: 'zen', icon: 'circlehollow', title: 'Liquid Zen Stone' },
          { value: 'flat', icon: 'stop', title: 'Solid Flat Background' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },

  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        "liquid-aurora": {
          name: 'liquid-aurora',
          value: '#F5F4F0',
        },
        "liquid-obsidian": {
          name: 'liquid-obsidian',
          value: '#12100E',
        },
        "thoughtstream-warm-white": {
          name: 'thoughtstream-warm-white',
          value: '#FAFAF9',
        },
        "thoughtstream-dark-bg": {
          name: 'thoughtstream-dark-bg',
          value: '#1C1917',
        },
      },
    },
    layout: 'centered',
  },

  decorators: [
    (Story, context) => {
      const selectedTheme = context.globals.theme || 'light';
      const liquidBackdrop = context.globals.liquidBackdrop || 'aurora';
      return (
        <div
          data-theme={selectedTheme}
          data-backdrop={liquidBackdrop}
          className={`thoughtstream-root thoughtstream-theme-${selectedTheme} thoughtstream-backdrop-${liquidBackdrop}`}
          style={{
            minHeight: '100vh',
            width: '100%',
            color: 'var(--ts-color-text-primary)',
            padding: '24px',
            boxSizing: 'border-box',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {liquidBackdrop !== 'flat' && (
            <div className="ts-liquid-ambient-backdrop" aria-hidden="true">
              <div className="ts-liquid-orb ts-liquid-orb--1" />
              <div className="ts-liquid-orb ts-liquid-orb--2" />
              <div className="ts-liquid-orb ts-liquid-orb--3" />
            </div>
          )}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '100%' }}>
            <Story />
          </div>
        </div>
      );
    },
  ],

  initialGlobals: {
    backgrounds: {
      value: '#F5F4F0',
    },
  },
};

export default preview;
