import React from 'react';
import './Divider.css';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  label?: React.ReactNode;
}

export const Divider: React.FC<DividerProps> = ({ label, className = '', ...props }) => {
  if (label) {
    return (
      <div className={['f7-divider', 'f7-divider--labeled', className].filter(Boolean).join(' ')} role="separator">
        <span className="f7-divider-line" />
        <span className="f7-divider-label">{label}</span>
        <span className="f7-divider-line" />
      </div>
    );
  }
  return <hr className={['f7-divider', className].filter(Boolean).join(' ')} {...props} />;
};

Divider.displayName = 'Divider';
