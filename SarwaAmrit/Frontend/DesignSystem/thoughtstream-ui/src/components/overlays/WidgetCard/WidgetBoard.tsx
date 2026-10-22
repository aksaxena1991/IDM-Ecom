import React, { useState } from 'react';
import './WidgetCard.css';

export interface WidgetBoardItem {
  id: string;
  content: React.ReactNode;
}

export interface WidgetBoardProps {
  /** Widgets currently on the canvas, in display order */
  items: WidgetBoardItem[];
  /** Shows the edit chrome on each card */
  editing?: boolean;
  /** Reorder after a drag from the grip */
  onReorder?: (ids: string[]) => void;
  /** Shown when nothing is selected */
  emptyLabel?: string;
  className?: string;
}

/**
 * The area where selected widgets are shown.
 * Cards sit in a responsive grid. While editing, the grip reorders them.
 */
export const WidgetBoard: React.FC<WidgetBoardProps> = ({
  items,
  editing = false,
  onReorder,
  emptyLabel = 'No widgets on this view. Use Add Widget to choose one.',
  className = '',
}) => {
  const [overId, setOverId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const gripArmed = React.useRef(false);
  const dragId = React.useRef<string | null>(null);

  const move = (fromId: string, toId: string) => {
    if (!onReorder || fromId === toId) return;
    const ids = items.map((item) => item.id);
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(toId);
    if (from < 0 || to < 0) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  if (items.length === 0) {
    return <div className="ts-widget-board-empty">{emptyLabel}</div>;
  }

  return (
    <div className={`ts-widget-board ${className}`.trim()}>
      {items.map((item) => {
        const expanded = expandedId === item.id;
        return (
          <div
            key={item.id}
            className={[
              'ts-widget-board-item',
              expanded ? 'ts-widget-board-item--expanded' : '',
              overId === item.id ? 'ts-widget-board-item--over' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            draggable={editing}
            onDragStart={(event) => {
              if (!gripArmed.current) {
                event.preventDefault();
                return;
              }
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', item.id);
              dragId.current = item.id;
            }}
            onDragOver={(event) => {
              if (!editing || !dragId.current) return;
              event.preventDefault();
              setOverId(item.id);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragId.current) move(dragId.current, item.id);
              dragId.current = null;
              setOverId(null);
            }}
            onDragEnd={() => {
              gripArmed.current = false;
              dragId.current = null;
              setOverId(null);
            }}
          >
            {React.isValidElement(item.content)
              ? React.cloneElement(item.content as React.ReactElement<Record<string, unknown>>, {
                  editing,
                  expanded,
                  onExpand: () =>
                    setExpandedId((current) => (current === item.id ? null : item.id)),
                  onDragGripPointerDown: () => {
                    gripArmed.current = true;
                  },
                  onDragGripPointerUp: () => {
                    gripArmed.current = false;
                  },
                })
              : item.content}
          </div>
        );
      })}
    </div>
  );
};

WidgetBoard.displayName = 'WidgetBoard';
