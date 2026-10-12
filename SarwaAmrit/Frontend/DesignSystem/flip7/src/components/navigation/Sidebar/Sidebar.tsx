import React from 'react';
import '../nav.css';

export interface SidebarItem {
  id: string;
  label: React.ReactNode;
}

export interface SidebarProps {
  items: SidebarItem[];
  value?: string;
  onChange?: (id: string) => void;
  title?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, value, onChange, title, className = '' }) => (
  <nav className={['f7-sidebar', className].filter(Boolean).join(' ')}>
    {title && <div style={{ fontWeight: 800, marginBottom: 12 }}>{title}</div>}
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        className={['f7-sidebar-item', value === item.id ? 'is-on' : ''].filter(Boolean).join(' ')}
        onClick={() => onChange?.(item.id)}
      >
        {item.label}
      </button>
    ))}
  </nav>
);
Sidebar.displayName = 'Sidebar';
