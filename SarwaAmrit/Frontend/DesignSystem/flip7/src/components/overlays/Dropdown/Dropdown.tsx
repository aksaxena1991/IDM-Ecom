import React, { useEffect, useRef, useState } from 'react';
import '../overlays.css';

export interface DropdownItem {
  id: string;
  label: React.ReactNode;
  onSelect?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, className = '' }) => {
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
    <div ref={root} className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <span onClick={() => setOpen((v) => !v)}>{trigger}</span>
      {open && (
        <div className="f7-dropdown-menu" role="menu">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="f7-select-option"
              role="menuitem"
              onClick={() => {
                item.onSelect?.();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
Dropdown.displayName = 'Dropdown';
