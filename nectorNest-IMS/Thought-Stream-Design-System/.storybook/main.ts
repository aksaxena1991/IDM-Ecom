import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  viteFinal: async (config, { configType }) => {
    // When building Storybook, disable the vite-plugin-dts to avoid unnecessary DTS rollup warnings
    if (configType === 'PRODUCTION') {
      config.plugins = (config.plugins || []).filter((plugin: any) => {
        return plugin && plugin.name !== 'vite:dts';
      });
    }
    config.resolve = config.resolve || {};
    config.resolve.dedupe = [...(config.resolve.dedupe || []), 'react', 'react-dom'];
    return config;
  }
};

export default config;
