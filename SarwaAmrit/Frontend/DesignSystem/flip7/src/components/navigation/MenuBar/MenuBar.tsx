import React from 'react';
import '../nav.css';

export interface MenuBarItem {
  id: string;
  label: React.ReactNode;
}

export interface MenuBarProps {
  items: MenuBarItem[];
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ items, value, onChange, className = '' }) => (
  <div className={['f7-menubar', className].filter(Boolean).join(' ')} role="menubar">
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        role="menuitem"
        className={['f7-menubar-item', value === item.id ? 'is-on' : ''].filter(Boolean).join(' ')}
        onClick={() => onChange?.(item.id)}
      >
        {item.label}
      </button>
    ))}
  </div>
);
MenuBar.displayName = 'MenuBar';
