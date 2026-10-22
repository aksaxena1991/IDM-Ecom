import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SkyLearnThemeOptions = {
  highContrast?: boolean;
  reducedMotion?: boolean;
  parentMode?: boolean;
};

type ThemeContextValue = SkyLearnThemeOptions & {
  setHighContrast: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setParentMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultHighContrast?: boolean;
  defaultReducedMotion?: boolean;
  defaultParentMode?: boolean;
  className?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultHighContrast = false,
  defaultReducedMotion = false,
  defaultParentMode = false,
  className = '',
}) => {
  const [highContrast, setHighContrast] = useState(defaultHighContrast);
  const [reducedMotion, setReducedMotion] = useState(defaultReducedMotion);
  const [parentMode, setParentMode] = useState(defaultParentMode);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (mq.matches) setReducedMotion(true);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const value = useMemo(
    () => ({
      highContrast,
      reducedMotion,
      parentMode,
      setHighContrast,
      setReducedMotion,
      setParentMode,
    }),
    [highContrast, reducedMotion, parentMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={['sl-root', className].filter(Boolean).join(' ')}
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
