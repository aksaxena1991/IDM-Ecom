import React, { useState, useRef } from 'react';
import './DragDrop.css';
import { GripVertical } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                 DRAG HANDLE                                */
/* -------------------------------------------------------------------------- */

export interface DragHandleProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  size?: number;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  className = '',
  size = 16,
  ...props
}) => {
  return (
    <span
      className={`ts-drag-handle ${className}`.trim()}
      aria-label="Drag handle"
      {...props}
    >
      <GripVertical size={size} />
    </span>
  );
};

DragHandle.displayName = 'DragHandle';

/* -------------------------------------------------------------------------- */
/*                              DRAGGABLE ITEM                                */
/* -------------------------------------------------------------------------- */

export interface DraggableProps {
  id: string;
  /** Custom data payload passed during drag & drop */
  data?: Record<string, unknown> | string;
  /** Disable dragging */
  disabled?: boolean;
  /** Require dragging via DragHandle */
  handleOnly?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Draggable: React.FC<DraggableProps> = ({
  id,
  data,
  disabled = false,
  handleOnly = false,
  onDragStart,
  onDragEnd,
  className = '',
  style,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    const payload = JSON.stringify({ id, data });
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.setData('text/plain', id);
    onDragStart?.(e);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    onDragEnd?.(e);
  };

  return (
    <div
      draggable={!disabled && !handleOnly}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={[
        'ts-draggable-card',
        isDragging ? 'ts-draggable-card--dragging' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      data-draggable-id={id}
    >
      {children}
    </div>
  );
};

Draggable.displayName = 'Draggable';

/* -------------------------------------------------------------------------- */
/*                              DROPPABLE ZONE                                */
/* -------------------------------------------------------------------------- */

export interface DroppableProps {
  id: string;
  /** Callback fired when a draggable item is dropped here */
  onDrop: (data: { id: string; data?: unknown }, e: React.DragEvent) => void;
  /** Optional filter callback to validate if drop is allowed */
  canDrop?: (data: { id: string; data?: unknown }) => boolean;
  placeholder?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Droppable: React.FC<DroppableProps> = ({
  id,
  onDrop,
  canDrop,
  placeholder,
  className = '',
  style,
  children,
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) {
      setIsOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only deactivate if leaving the container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);

    try {
      const raw = e.dataTransfer.getData('application/json');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!canDrop || canDrop(parsed)) {
          onDrop(parsed, e);
        }
      } else {
        const plainId = e.dataTransfer.getData('text/plain');
        if (plainId) {
          onDrop({ id: plainId }, e);
        }
      }
    } catch {
      const plainId = e.dataTransfer.getData('text/plain');
      if (plainId) {
        onDrop({ id: plainId }, e);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'ts-droppable-zone',
        isOver ? 'ts-droppable-zone--active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      data-droppable-id={id}
    >
      {children}
      {React.Children.count(children) === 0 && placeholder && (
        <div className="ts-droppable-zone-empty">{placeholder}</div>
      )}
    </div>
  );
};

Droppable.displayName = 'Droppable';

/* -------------------------------------------------------------------------- */
/*                               SORTABLE LIST                                */
/* -------------------------------------------------------------------------- */

export interface SortableItemData {
  id: string;
  [key: string]: any;
}

export interface SortableListProps<T extends { id: string } = SortableItemData> {
  items: T[];
  /** Callback fired when items are reordered */
  onReorder: (newItems: T[], fromIndex: number, toIndex: number) => void;
  /** Render function for each item */
  renderItem?: (item: T, index: number, dragHandle: React.ReactNode) => React.ReactNode;
  /** Primary label key if renderItem is not provided */
  labelKey?: keyof T;
  /** Secondary subtitle/description key */
  subtitleKey?: keyof T;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ThoughtStream SortableList Component
 *
 * Implements a distraction-free drag-and-drop sortable list with
 * grip handles, insertion drop lines, and fluid reordering.
 */
export function SortableList<T extends { id: string } = SortableItemData>({
  items,
  onReorder,
  renderItem,
  labelKey = 'label' as keyof T,
  subtitleKey,
  className = '',
  style,
}: SortableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);
  const dragNodeRef = useRef<HTMLElement | null>(null);

  const handleDragStart = (index: number, e: React.DragEvent<HTMLElement>) => {
    setDraggedIndex(index);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (index: number, e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isTop = e.clientY < midY;

    setOverIndex(index);
    setDropPosition(isTop ? 'top' : 'bottom');
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setOverIndex(null);
    setDropPosition(null);
    dragNodeRef.current = null;
  };

  const handleDrop = (targetIndex: number, e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    const newItems = [...items];
    const [movedItem] = newItems.splice(draggedIndex, 1);

    let finalIndex = targetIndex;
    if (dropPosition === 'bottom' && draggedIndex < targetIndex) {
      // Position after target
      finalIndex = targetIndex;
    } else if (dropPosition === 'bottom' && draggedIndex > targetIndex) {
      finalIndex = targetIndex + 1;
    } else if (dropPosition === 'top' && draggedIndex < targetIndex) {
      finalIndex = targetIndex - 1;
    }

    // Bound within array
    finalIndex = Math.max(0, Math.min(newItems.length, finalIndex));
    newItems.splice(finalIndex, 0, movedItem);

    onReorder(newItems, draggedIndex, finalIndex);
    handleDragEnd();
  };

  return (
    <ul className={`ts-sortable-list ${className}`.trim()} style={style}>
      {items.map((item, index) => {
        const isDragging = draggedIndex === index;
        const isOver = overIndex === index && draggedIndex !== index;
        const showTopBorder = isOver && dropPosition === 'top';
        const showBottomBorder = isOver && dropPosition === 'bottom';

        const handle = <DragHandle />;

        return (
          <li
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(index, e)}
            onDragOver={(e) => handleDragOver(index, e)}
            onDrop={(e) => handleDrop(index, e)}
            onDragEnd={handleDragEnd}
            className={[
              'ts-sortable-item',
              isDragging ? 'ts-sortable-item--dragging' : '',
              showTopBorder ? 'ts-sortable-item--drag-over-top' : '',
              showBottomBorder ? 'ts-sortable-item--drag-over-bottom' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {renderItem ? (
              renderItem(item, index, handle)
            ) : (
              <div className="ts-sortable-item-left">
                {handle}
                <div className="ts-sortable-item-content">
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>
                    {String(item[labelKey] ?? item.id)}
                  </div>
                  {subtitleKey && item[subtitleKey] && (
                    <div style={{ fontSize: '12px', color: 'var(--ts-color-text-secondary)', marginTop: '2px' }}>
                      {String(item[subtitleKey])}
                    </div>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

SortableList.displayName = 'SortableList';
