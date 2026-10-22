import type { Preview } from '@storybook/react-vite';
import React from 'react';

import { AccessibilityToolbar } from '../src/components/theme/AccessibilityToolbar/AccessibilityToolbar.js';
import { ThemeProvider } from '../src/components/theme/ThemeProvider/ThemeProvider.js';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      options: {
        white: { name: 'Background', value: '#FFFFFF' },
        surface: { name: 'Surface', value: '#F8FAFC' },
        skySoft: { name: 'Sky Soft', value: '#DBEAFE' },
      },
    },
    docs: {
      toc: true,
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@500;700&family=Lexend+Deca:wght@400;600&family=Nunito+Sans:wght@400;600;700&family=Nunito:wght@600;700&family=Quicksand:wght@600;700&display=swap"
        />
        <div className="sl-container">
          <AccessibilityToolbar />
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  initialGlobals: {
    backgrounds: { value: 'white' },
  },
};

export default preview;
