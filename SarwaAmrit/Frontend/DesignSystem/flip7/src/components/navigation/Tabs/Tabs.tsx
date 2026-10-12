import React, { useState } from 'react';
import '../nav.css';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, value, defaultValue, onChange, className = '' }) => {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id ?? '');
  const current = value ?? internal;
  const active = items.find((t) => t.id === current);
  return (
    <div className={['f7-tabs', className].filter(Boolean).join(' ')}>
      <div className="f7-tablist" role="tablist">
        {items.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === current}
            className={['f7-tab', tab.id === current ? 'is-on' : ''].filter(Boolean).join(' ')}
            onClick={() => {
              if (value === undefined) setInternal(tab.id);
              onChange?.(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {active?.content && <div role="tabpanel">{active.content}</div>}
    </div>
  );
};
Tabs.displayName = 'Tabs';
