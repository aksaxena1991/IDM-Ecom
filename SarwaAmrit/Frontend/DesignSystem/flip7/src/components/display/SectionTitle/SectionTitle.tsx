import React from 'react';
import './SectionTitle.css';

export interface SectionTitleProps {
  /** Emoji rendered in a view container, not as raw text, for alignment. */
  emoji?: string;
  /** Inverse for teal / dark game headers */
  tone?: 'default' | 'inverse';
  children: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  emoji,
  tone = 'default',
  children,
  className = '',
}) => {
  return (
    <div
      className={['f7-section-title', `f7-section-title--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {emoji && (
        <span className="f7-emoji f7-section-title-emoji" role="img" aria-hidden="true">
          {emoji}
        </span>
      )}
      <h3 className="f7-section-title-text">{children}</h3>
    </div>
  );
};

SectionTitle.displayName = 'SectionTitle';
