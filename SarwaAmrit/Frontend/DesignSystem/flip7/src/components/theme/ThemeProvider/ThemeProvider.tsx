import React, { createContext, useContext } from 'react';

export interface ThemeContextValue {
  rpx: number;
}

const ThemeContext = createContext<ThemeContextValue>({ rpx: 1 });

export interface ThemeProviderProps {
  /** Pixel size of 1rpx. Defaults to 1 for Storybook / web. */
  rpx?: number;
  children: React.ReactNode;
  className?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  rpx = 1,
  children,
  className = '',
}) => {
  return (
    <ThemeContext.Provider value={{ rpx }}>
      <div
        className={['flip7-root', className].filter(Boolean).join(' ')}
        style={{ ['--f7-rpx' as string]: `${rpx}px` }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';

export const useTheme = (): ThemeContextValue => {
  return useContext(ThemeContext);
};
