import React from 'react';
import './DragDropZone.css';

export interface DragDropZoneProps {
  active?: boolean;
  label?: string;
  children?: React.ReactNode;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  active = false,
  label = 'Drag answers here',
  children,
}) => {
  return (
    <div
      className={['sl-drop-zone', active ? 'sl-drop-zone--active' : ''].filter(Boolean).join(' ')}
      role="region"
      aria-label={label}
    >
      {children ?? <p className="sl-drop-zone__hint">{label}</p>}
    </div>
  );
};
