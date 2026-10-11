import React from 'react';
import './ScoringCard.css';

export type ScoringCardState = 'default' | 'highlighted' | 'boom';

export interface ScoringCardProps {
  state?: ScoringCardState;
  title?: React.ReactNode;
  score?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const ScoringCard: React.FC<ScoringCardProps> = ({
  state = 'default',
  title,
  score,
  meta,
  actions,
  children,
  className = '',
}) => {
  return (
    <div className={['f7-score-card', `f7-score-card--${state}`, className].filter(Boolean).join(' ')}>
      <div className="f7-score-card-body">
        {(title || score) && (
          <div className="f7-score-card-row">
            {title && <div className="f7-score-card-title">{title}</div>}
            {score != null && <div className="f7-score-card-score">{score}</div>}
          </div>
        )}
        {meta && <div className="f7-score-card-meta">{meta}</div>}
        {children}
      </div>
      {actions && <div className="f7-score-card-actions">{actions}</div>}
    </div>
  );
};

ScoringCard.displayName = 'ScoringCard';
