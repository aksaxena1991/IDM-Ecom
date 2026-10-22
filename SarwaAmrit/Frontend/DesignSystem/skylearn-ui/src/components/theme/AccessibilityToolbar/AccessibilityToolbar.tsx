import React from 'react';

import { useSkyLearnTheme } from '../ThemeProvider/ThemeProvider.js';
import './AccessibilityToolbar.css';

export const AccessibilityToolbar: React.FC = () => {
  const theme = useSkyLearnTheme();

  return (
    <div className="sl-a11y-toolbar" role="group" aria-label="Accessibility and view options">
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
