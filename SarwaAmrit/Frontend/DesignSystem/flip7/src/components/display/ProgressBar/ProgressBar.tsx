import React from 'react';
import './ProgressBar.css';

export type ProgressTone = 'teal' | 'gold' | 'coral' | 'sky';
export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: ProgressTone;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, tone = 'teal', label, className = '' }) => {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div className={['f7-progress', className].filter(Boolean).join(' ')}>
      {label && <div className="f7-progress-label">{label}</div>}
      <div className="f7-progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className={`f7-progress-fill f7-progress-fill--${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
ProgressBar.displayName = 'ProgressBar';
