import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';

const preview: Preview = {
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
        'flip7-surface': {
          name: 'Surface Base',
          value: '#EFF8F7',
        },
        'flip7-cream': {
          name: 'Cream',
          value: '#FFF8E7',
        },
        'flip7-teal': {
          name: 'Primary Teal',
          value: '#2BA8A2',
        },
        'flip7-primary-bg': {
          name: 'Primary BG',
          value: '#E8F6F5',
        },
      },
    },
    layout: 'centered',
  },

  decorators: [
    (Story) => (
      <div
        className="flip7-root"
        style={{
          minHeight: '100%',
          width: '100%',
          color: 'var(--f7-color-primary-dark)',
          fontFamily: 'var(--f7-font-body)',
          boxSizing: 'border-box',
        }}
      >
        <Story />
      </div>
    ),
  ],

  initialGlobals: {
    backgrounds: {
      value: 'flip7-surface',
    },
  },
};

export default preview;
