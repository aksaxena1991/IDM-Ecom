import React, { useEffect, useRef, useState } from 'react';
import '../overlays.css';

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({ trigger, children, className = '' }) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={root} className={['f7-popover-wrap', className].filter(Boolean).join(' ')} style={{ position: 'relative', display: 'inline-block' }}>
      <span onClick={() => setOpen((v) => !v)}>{trigger}</span>
      {open && <div className="f7-popover">{children}</div>}
    </div>
  );
};
Popover.displayName = 'Popover';
