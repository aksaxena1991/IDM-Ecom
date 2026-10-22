import React from 'react';
import { ProgressBar } from '../ProgressBar/ProgressBar.js';
import './LessonCard.css';

export interface LessonCardProps {
  title: string;
  description: string;
  progress?: number;
  locked?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  title,
  description,
  progress = 0,
  locked = false,
  active = false,
  icon,
  onClick,
}) => {
  const className = [
    'sl-lesson-card',
    locked ? 'sl-lesson-card--locked' : '',
    active ? 'sl-lesson-card--active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      <div className="sl-lesson-card__icon" aria-hidden>
        {locked ? (
          <span className="sl-lesson-card__lock" title="Locked">
            🔒
          </span>
        ) : (
          icon ?? '📖'
        )}
      </div>
      <h3 className="sl-lesson-card__title">{title}</h3>
      <p className="sl-lesson-card__desc">{description}</p>
      {!locked ? <ProgressBar value={progress} label="Progress" /> : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={locked ? undefined : onClick}
        disabled={locked}
        aria-disabled={locked || undefined}
      >
        {inner}
      </button>
    );
  }

  return <article className={className}>{inner}</article>;
};
