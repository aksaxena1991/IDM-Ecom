import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  /** Current configured theme mode ('light', 'dark', or 'system') */
  theme: Theme;
  /** Resolved active theme ('light' or 'dark') */
  resolvedTheme: 'light' | 'dark';
  /** Set the theme */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  /** Initial theme setting, defaults to 'light' */
  defaultTheme?: Theme;
  /** Storage key for persisting theme selection in localStorage */
  storageKey?: string;
  /** Children nodes */
  children: React.ReactNode;
}

/**
 * ThoughtStream ThemeProvider
 *
 * Injects `data-theme="light"` or `data-theme="dark"` into the DOM
 * and provides a hook for responsive theme switching.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  defaultTheme = 'light',
  storageKey = 'thoughtstream-theme',
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;

    const resolveCurrentTheme = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    const activeTheme = resolveCurrentTheme();
    setResolvedTheme(activeTheme);

    root.setAttribute('data-theme', activeTheme);
    if (activeTheme === 'dark') {
      root.classList.add('thoughtstream-theme-dark');
      root.classList.remove('thoughtstream-theme-light');
    } else {
      root.classList.add('thoughtstream-theme-light');
      root.classList.remove('thoughtstream-theme-dark');
    }

    // Media query listener when in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        root.setAttribute('data-theme', newTheme);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';

/**
 * Hook to access and toggle ThoughtStream theme
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
