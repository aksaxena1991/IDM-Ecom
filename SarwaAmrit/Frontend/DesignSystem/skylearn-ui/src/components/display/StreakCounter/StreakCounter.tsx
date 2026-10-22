import React from 'react';
import './StreakCounter.css';

export interface StreakCounterProps {
  count: number;
  className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ count, className = '' }) => {
  const tier =
    count >= 30 ? 'sl-streak--legend' : count >= 14 ? 'sl-streak--hot' : 'sl-streak--warm';

  return (
    <div
      className={['sl-streak', tier, className].filter(Boolean).join(' ')}
      aria-label={`${count} day streak`}
    >
      <span className="sl-streak__flame" aria-hidden>
        🔥
      </span>
      <span className="sl-streak__count">{count}</span>
    </div>
  );
};
