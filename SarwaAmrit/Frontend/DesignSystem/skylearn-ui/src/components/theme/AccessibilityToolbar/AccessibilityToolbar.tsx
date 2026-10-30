import React from 'react';

import type { ColorSchemePreference } from '../ThemeProvider/ThemeProvider.js';
import { useSkyLearnTheme } from '../ThemeProvider/ThemeProvider.js';
import './AccessibilityToolbar.css';

const SCHEME_OPTIONS: { value: ColorSchemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export const AccessibilityToolbar: React.FC = () => {
  const theme = useSkyLearnTheme();

  return (
    <div className="sl-a11y-toolbar" role="group" aria-label="Accessibility and view options">
      <label className="sl-a11y-toolbar__item sl-a11y-toolbar__item--select">
        <span>Appearance</span>
        <select
          value={theme.colorSchemePreference ?? 'light'}
          onChange={(e) => theme.setColorScheme(e.target.value as ColorSchemePreference)}
          aria-label="Color scheme"
        >
          {SCHEME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="sl-a11y-toolbar__item">
        <input
          type="checkbox"
          checked={theme.highContrast}
          onChange={(e) => theme.setHighContrast(e.target.checked)}
        />
        High contrast
      </label>
      <label className="sl-a11y-toolbar__item">
        <input
          type="checkbox"
          checked={theme.reducedMotion}
          onChange={(e) => theme.setReducedMotion(e.target.checked)}
        />
        Reduced motion
      </label>
      <label className="sl-a11y-toolbar__item">
        <input
          type="checkbox"
          checked={theme.parentMode}
          onChange={(e) => theme.setParentMode(e.target.checked)}
        />
        Parent / teacher view
      </label>
    </div>
  );
};
