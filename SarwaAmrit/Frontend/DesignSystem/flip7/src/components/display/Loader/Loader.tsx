import React from 'react';
import './Loader.css';

export interface LoaderProps {
  label?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ label = 'Shuffling…', className = '' }) => (
  <div className={['f7-loader', className].filter(Boolean).join(' ')} role="status" aria-live="polite">
    <span className="f7-loader-dot f7-loader-dot--teal" />
    <span className="f7-loader-dot f7-loader-dot--gold" />
    <span className="f7-loader-dot f7-loader-dot--coral" />
    {label && <span className="f7-loader-label">{label}</span>}
  </div>
);
Loader.displayName = 'Loader';
