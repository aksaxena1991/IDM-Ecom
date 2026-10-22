import React from 'react';
import { useSkyLearnTheme } from '../../theme/ThemeProvider/ThemeProvider.js';
import './ParentViewSwitcher.css';

export const ParentViewSwitcher: React.FC = () => {
  const { parentMode, setParentMode } = useSkyLearnTheme();

  return (
    <div className="sl-parent-switch" role="group" aria-label="View mode">
      <button
        type="button"
        className={['sl-parent-switch__btn', !parentMode ? 'sl-parent-switch__btn--active' : ''].join(' ')}
        aria-pressed={!parentMode}
        onClick={() => setParentMode(false)}
      >
        Kid mode
      </button>
      <button
        type="button"
        className={['sl-parent-switch__btn', parentMode ? 'sl-parent-switch__btn--active' : ''].join(' ')}
        aria-pressed={parentMode}
        onClick={() => setParentMode(true)}
      >
        Parent / teacher
      </button>
    </div>
  );
};
