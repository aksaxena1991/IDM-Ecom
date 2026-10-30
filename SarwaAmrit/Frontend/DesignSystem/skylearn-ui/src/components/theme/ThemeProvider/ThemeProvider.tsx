import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ColorSchemePreference = 'light' | 'dark' | 'system';
export type ResolvedColorScheme = 'light' | 'dark';

export type SkyLearnThemeOptions = {
  highContrast?: boolean;
  reducedMotion?: boolean;
  parentMode?: boolean;
  colorScheme?: ResolvedColorScheme;
  colorSchemePreference?: ColorSchemePreference;
};

type ThemeContextValue = SkyLearnThemeOptions & {
  setHighContrast: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setParentMode: (value: boolean) => void;
  setColorScheme: (value: ColorSchemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultHighContrast?: boolean;
  defaultReducedMotion?: boolean;
  defaultParentMode?: boolean;
  /** Light, dark, or follow OS (`system`). */
  defaultColorScheme?: ColorSchemePreference;
  className?: string;
}

function getSystemColorScheme(): ResolvedColorScheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultHighContrast = false,
  defaultReducedMotion = false,
  defaultParentMode = false,
  defaultColorScheme = 'light',
  className = '',
}) => {
  const [highContrast, setHighContrast] = useState(defaultHighContrast);
  const [reducedMotion, setReducedMotion] = useState(defaultReducedMotion);
  const [parentMode, setParentMode] = useState(defaultParentMode);
  const [colorSchemePreference, setColorScheme] = useState<ColorSchemePreference>(defaultColorScheme);
  const [systemColorScheme, setSystemColorScheme] = useState<ResolvedColorScheme>(() =>
    getSystemColorScheme(),
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (mq.matches) setReducedMotion(true);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setSystemColorScheme(mq.matches ? 'dark' : 'light');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const resolvedColorScheme: ResolvedColorScheme =
    colorSchemePreference === 'system' ? systemColorScheme : colorSchemePreference;

  const value = useMemo(
    () => ({
      highContrast,
      reducedMotion,
      parentMode,
      colorScheme: resolvedColorScheme,
      colorSchemePreference,
      setHighContrast,
      setReducedMotion,
      setParentMode,
      setColorScheme,
    }),
    [highContrast, reducedMotion, parentMode, resolvedColorScheme, colorSchemePreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={['sl-root', className].filter(Boolean).join(' ')}
        data-color-scheme={resolvedColorScheme}
        data-high-contrast={highContrast ? 'true' : 'false'}
        data-reduced-motion={reducedMotion ? 'true' : 'false'}
        data-parent-mode={parentMode ? 'true' : 'false'}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export function useSkyLearnTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useSkyLearnTheme must be used within ThemeProvider');
  }
  return ctx;
}
