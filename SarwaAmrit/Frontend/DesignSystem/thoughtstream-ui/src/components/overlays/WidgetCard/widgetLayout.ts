export type WidgetColumnSpan = 1 | 2 | 3 | 4;

export interface WidgetLayout {
  columnSpan: WidgetColumnSpan;
  /** Height in grid row units (each row is `--ts-widget-row-unit`) */
  rowSpan: number;
}

export const DEFAULT_WIDGET_LAYOUT: WidgetLayout = {
  columnSpan: 2,
  rowSpan: 1,
};

export const MAX_WIDGET_ROW_SPAN = 12;

export function clampColumnSpan(value: number, maxColumns: number): WidgetColumnSpan {
  const clamped = Math.min(maxColumns, Math.max(1, Math.round(value)));
  return clamped as WidgetColumnSpan;
}

export function growWidgetLayout(
  layout: WidgetLayout,
  maxColumns: number
): WidgetLayout {
  if (layout.columnSpan < maxColumns) {
    return {
      ...layout,
      columnSpan: clampColumnSpan(layout.columnSpan + 1, maxColumns),
    };
  }
  if (layout.rowSpan < MAX_WIDGET_ROW_SPAN) {
    return { ...layout, rowSpan: layout.rowSpan + 1 };
  }
  return layout;
}

export function shrinkWidgetLayout(layout: WidgetLayout): WidgetLayout {
  if (layout.columnSpan > 1) {
    return {
      ...layout,
      columnSpan: clampColumnSpan(layout.columnSpan - 1, 4),
    };
  }
  if (layout.rowSpan > 1) {
    return { ...layout, rowSpan: layout.rowSpan - 1 };
  }
  return layout;
}

export function canGrowWidgetLayout(
  layout: WidgetLayout,
  maxColumns: number
): boolean {
  return layout.columnSpan < maxColumns || layout.rowSpan < MAX_WIDGET_ROW_SPAN;
}

export function canShrinkWidgetLayout(layout: WidgetLayout): boolean {
  return layout.columnSpan > 1 || layout.rowSpan > 1;
}
