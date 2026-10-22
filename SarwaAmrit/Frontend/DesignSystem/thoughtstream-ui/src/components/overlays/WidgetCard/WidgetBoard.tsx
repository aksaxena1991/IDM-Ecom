import React, { useCallback, useState } from 'react';
import {
  canGrowWidgetLayout,
  canShrinkWidgetLayout,
  DEFAULT_WIDGET_LAYOUT,
  growWidgetLayout,
  shrinkWidgetLayout,
  type WidgetLayout,
} from './widgetLayout';
import './WidgetCard.css';

export interface WidgetBoardItem {
  id: string;
  content: React.ReactNode;
  /** Optional starting layout for this widget */
  layout?: WidgetLayout;
}

export interface WidgetBoardProps {
  /** Widgets currently on the canvas, in display order */
  items: WidgetBoardItem[];
  /** Base column count for the grid (1–4) */
  columns?: 1 | 2 | 3 | 4;
  /** Controlled layout map keyed by widget id */
  layouts?: Record<string, WidgetLayout>;
  /** Fired when any widget layout changes */
  onLayoutsChange?: (layouts: Record<string, WidgetLayout>) => void;
  /** Shows the edit chrome on each card */
  editing?: boolean;
  /** Reorder after a drag from the grip */
  onReorder?: (ids: string[]) => void;
  /** Shown when nothing is selected */
  emptyLabel?: string;
  className?: string;
}

function resolveLayouts(
  items: WidgetBoardItem[],
  columns: number,
  controlled?: Record<string, WidgetLayout>,
  fallback?: Record<string, WidgetLayout>
): Record<string, WidgetLayout> {
  const next: Record<string, WidgetLayout> = { ...fallback, ...controlled };
  for (const item of items) {
    const base = next[item.id] ?? item.layout ?? DEFAULT_WIDGET_LAYOUT;
    next[item.id] = {
      columnSpan: Math.min(base.columnSpan, columns) as WidgetLayout['columnSpan'],
      rowSpan: Math.max(1, base.rowSpan),
    };
  }
  return next;
}

/**
 * Canvas for dashboard widgets on a fixed-column grid.
 * Each card spans 1–4 columns and one or more row units; edit tools resize it.
 */
export const WidgetBoard: React.FC<WidgetBoardProps> = ({
  items,
  columns = 4,
  layouts: controlledLayouts,
  onLayoutsChange,
  editing = false,
  onReorder,
  emptyLabel = 'No widgets on this view. Use Add Widget to choose one.',
  className = '',
}) => {
  const [internalLayouts, setInternalLayouts] = useState<Record<string, WidgetLayout>>({});
  const [overId, setOverId] = useState<string | null>(null);
  const gripArmed = React.useRef(false);
  const dragId = React.useRef<string | null>(null);

  const layouts = resolveLayouts(
    items,
    columns,
    controlledLayouts,
    controlledLayouts === undefined ? internalLayouts : undefined
  );

  const setLayoutFor = useCallback(
    (id: string, updater: (current: WidgetLayout) => WidgetLayout) => {
      const current = layouts[id] ?? DEFAULT_WIDGET_LAYOUT;
      const nextLayout = updater(current);
      const next = { ...layouts, [id]: nextLayout };
      if (controlledLayouts === undefined) {
        setInternalLayouts(next);
      }
      onLayoutsChange?.(next);
    },
    [controlledLayouts, layouts, onLayoutsChange]
  );

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
    <div
      className={`ts-widget-board ts-widget-board--cols-${columns} ${className}`.trim()}
      style={{ ['--ts-widget-board-columns' as string]: String(columns) }}
    >
      {items.map((item) => {
        const layout = layouts[item.id] ?? DEFAULT_WIDGET_LAYOUT;
        const canGrow = canGrowWidgetLayout(layout, columns);
        const canShrink = canShrinkWidgetLayout(layout);

        return (
          <div
            key={item.id}
            className={[
              'ts-widget-board-item',
              overId === item.id ? 'ts-widget-board-item--over' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              gridColumn: `span ${layout.columnSpan}`,
              gridRow: `span ${layout.rowSpan}`,
            }}
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
                  layout,
                  onGrow: canGrow
                    ? () => setLayoutFor(item.id, (current) => growWidgetLayout(current, columns))
                    : undefined,
                  onShrink: canShrink
                    ? () => setLayoutFor(item.id, (current) => shrinkWidgetLayout(current))
                    : undefined,
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
