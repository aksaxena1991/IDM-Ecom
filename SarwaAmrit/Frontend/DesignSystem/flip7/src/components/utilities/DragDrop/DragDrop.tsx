import React, { useState } from 'react';
import '../utilities.css';

export interface DragDropItem {
  id: string;
  label: React.ReactNode;
}

export interface DragDropProps {
  items: DragDropItem[];
  onReorder?: (items: DragDropItem[]) => void;
  className?: string;
}

export const DragDrop: React.FC<DragDropProps> = ({ items, onReorder, className = '' }) => {
  const [list, setList] = useState(items);
  const [from, setFrom] = useState<string | null>(null);

  const move = (toId: string) => {
    if (!from || from === toId) return;
    const next = [...list];
    const a = next.findIndex((i) => i.id === from);
    const b = next.findIndex((i) => i.id === toId);
    const [moved] = next.splice(a, 1);
    next.splice(b, 0, moved);
    setList(next);
    onReorder?.(next);
    setFrom(null);
  };

  return (
    <div className={['f7-dd', className].filter(Boolean).join(' ')}>
      {list.map((item) => (
        <div
          key={item.id}
          className="f7-dd-item"
          draggable
          onDragStart={() => setFrom(item.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => move(item.id)}
        >
          {item.label}
          <span aria-hidden="true">☰</span>
        </div>
      ))}
    </div>
  );
};
DragDrop.displayName = 'DragDrop';
