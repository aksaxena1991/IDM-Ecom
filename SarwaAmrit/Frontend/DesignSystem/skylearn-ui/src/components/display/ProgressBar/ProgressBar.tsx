import React, { useEffect, useRef, useState } from 'react';
import './ProgressBar.css';

const MILESTONES = [25, 50, 75, 100];

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  celebrate?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  celebrate = false,
  className = '',
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const prevPct = useRef(pct);
  const [milestoneSparkle, setMilestoneSparkle] = useState(false);

  useEffect(() => {
    const crossed = MILESTONES.some((m) => prevPct.current < m && pct >= m);
    prevPct.current = pct;
    if (!crossed && !celebrate) return;
    if (crossed || celebrate) {
      setMilestoneSparkle(true);
      const timer = window.setTimeout(() => setMilestoneSparkle(false), 520);
      return () => window.clearTimeout(timer);
    }
  }, [pct, celebrate]);

  return (
    <div className={['sl-progress', className].filter(Boolean).join(' ')}>
      {label ? (
        <div className="sl-progress__label">
          <span>{label}</span>
          <span className="sl-progress__value">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <div
        className="sl-progress__track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={[
            'sl-progress__fill',
            celebrate ? 'sl-progress__fill--celebrate' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ width: `${pct}%` }}
        />
        {milestoneSparkle ? (
          <div className="sl-progress__sparkles" style={{ left: `${pct}%` }} aria-hidden>
            <span />
            <span />
            <span />
          </div>
        ) : null}
      </div>
    </div>
  );
};
