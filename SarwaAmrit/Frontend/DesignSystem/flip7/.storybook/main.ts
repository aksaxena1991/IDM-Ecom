import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  viteFinal: async (config, { configType }) => {
    if (configType === 'PRODUCTION') {
      config.plugins = (config.plugins || []).filter((plugin: unknown) => {
        const name = (plugin as { name?: string } | null)?.name;
        return name !== 'vite:dts';
      });
    }
    config.resolve = config.resolve || {};
    config.resolve.dedupe = [...(config.resolve.dedupe || []), 'react', 'react-dom'];
    return config;
  },
};

export default config;
