import React from 'react';
import './Crown.css';

export interface CrownProps {
  className?: string;
}

export const Crown: React.FC<CrownProps> = ({ className = '' }) => {
  return (
    <span className={['f7-emoji', 'f7-crown', 'f7-anim-crown', className].filter(Boolean).join(' ')} role="img" aria-label="Winner">
      👑
    </span>
  );
};

Crown.displayName = 'Crown';
