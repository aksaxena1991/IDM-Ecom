import React from 'react';
import '../overlays.css';

export interface SplitScreenProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({ left, right, className = '' }) => (
  <div className={['f7-split', className].filter(Boolean).join(' ')}>
    <div className="f7-split-pane">{left}</div>
    <div className="f7-split-pane">{right}</div>
  </div>
);
SplitScreen.displayName = 'SplitScreen';
