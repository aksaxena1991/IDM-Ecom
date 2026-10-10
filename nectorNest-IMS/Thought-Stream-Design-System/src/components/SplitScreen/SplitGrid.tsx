import React, {
  useState,
  useRef,
  Children,
  isValidElement,
  useEffect,
} from 'react';
import './SplitScreen.css';

export interface SplitGridCellProps {
  /** Row index (0-indexed). Defaults to auto-placement based on child order. */
  row?: number;
  /** Column index (0-indexed). Defaults to auto-placement based on child order. */
  col?: number;
  /** Number of rows this cell spans */
  rowSpan?: number;
  /** Number of columns this cell spans */
  colSpan?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const SplitGridCell: React.FC<SplitGridCellProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div className={`ts-split-grid-cell ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

SplitGridCell.displayName = 'SplitGridCell';

export interface SplitGridProps {
  /** Number of columns across the grid (default 2) */
  columns?: number;
  /** Number of rows down the grid (default 2) */
  rows?: number;
  /** Initial column size percentages (e.g. [50, 50]) */
  defaultColSizes?: number[];
  /** Initial row size percentages (e.g. [50, 50]) */
  defaultRowSizes?: number[];
  /** Controlled column sizes */
  colSizes?: number[];
  /** Controlled row sizes */
  rowSizes?: number[];
  /** Callback fired when column widths are adjusted */
  onColResize?: (colSizes: number[]) => void;
  /** Callback fired when row heights are adjusted */
  onRowResize?: (rowSizes: number[]) => void;
  /** Minimum column size in pixels */
  minColSize?: number;
  /** Minimum row size in pixels */
  minRowSize?: number;
  /** Allow double-clicking dividers or intersection handles to equalize sizes */
  allowReset?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * ThoughtStream SplitGrid (Split Screen Grid System)
 *
 * Provides a 2D multi-pane resizable grid with column gutters, row gutters,
 * and 2D intersection handles for simultaneous X/Y resizing.
 */
export const SplitGrid: React.FC<SplitGridProps> = ({
  columns = 2,
  rows = 2,
  defaultColSizes,
  defaultRowSizes,
  colSizes: controlledColSizes,
  rowSizes: controlledRowSizes,
  onColResize,
  onRowResize,
  minColSize = 80,
  minRowSize = 60,
  allowReset = true,
  className = '',
  style,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize even percentages
  const initialCols = defaultColSizes && defaultColSizes.length === columns
    ? defaultColSizes
    : Array(columns).fill(100 / (columns || 1));

  const initialRows = defaultRowSizes && defaultRowSizes.length === rows
    ? defaultRowSizes
    : Array(rows).fill(100 / (rows || 1));

  const [internalCols, setInternalCols] = useState<number[]>(initialCols);
  const [internalRows, setInternalRows] = useState<number[]>(initialRows);

  const activeCols = controlledColSizes || internalCols;
  const activeRows = controlledRowSizes || internalRows;

  // Sync size arrays if rows/columns props change
  useEffect(() => {
    if (activeCols.length !== columns && columns > 0) {
      setInternalCols(Array(columns).fill(100 / columns));
    }
  }, [columns, activeCols.length]);

  useEffect(() => {
    if (activeRows.length !== rows && rows > 0) {
      setInternalRows(Array(rows).fill(100 / rows));
    }
  }, [rows, activeRows.length]);

  // Drag tracking state
  const [activeDrag, setActiveDrag] = useState<
    | { type: 'col'; index: number }
    | { type: 'row'; index: number }
    | { type: 'intersection'; colIndex: number; rowIndex: number }
    | null
  >(null);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialCols: number[];
    initialRows: number[];
    width: number;
    height: number;
  } | null>(null);

  const handlePointerDownCol = (colIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = containerRef.current.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialCols: [...activeCols],
      initialRows: [...activeRows],
      width: rect.width,
      height: rect.height,
    };
    setActiveDrag({ type: 'col', index: colIndex });
  };

  const handlePointerDownRow = (rowIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = containerRef.current.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialCols: [...activeCols],
      initialRows: [...activeRows],
      width: rect.width,
      height: rect.height,
    };
    setActiveDrag({ type: 'row', index: rowIndex });
  };

  const handlePointerDownIntersection = (
    colIndex: number,
    rowIndex: number,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!containerRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = containerRef.current.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialCols: [...activeCols],
      initialRows: [...activeRows],
      width: rect.width,
      height: rect.height,
    };
    setActiveDrag({ type: 'intersection', colIndex, rowIndex });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDrag || !dragStartRef.current || !containerRef.current) return;

    const { startX, startY, initialCols, initialRows, width, height } = dragStartRef.current;

    if (activeDrag.type === 'col' || activeDrag.type === 'intersection') {
      const colIdx = activeDrag.type === 'col' ? activeDrag.index : activeDrag.colIndex;
      if (width > 0) {
        const deltaX = e.clientX - startX;
        const deltaPercent = (deltaX / width) * 100;
        const minPercent = (minColSize / width) * 100;

        const pairTotal = initialCols[colIdx] + initialCols[colIdx + 1];
        let newLeft = initialCols[colIdx] + deltaPercent;

        if (newLeft < minPercent) newLeft = minPercent;
        if (newLeft > pairTotal - minPercent) newLeft = pairTotal - minPercent;

        const newRight = pairTotal - newLeft;

        const updated = [...initialCols];
        updated[colIdx] = newLeft;
        updated[colIdx + 1] = newRight;

        if (!controlledColSizes) {
          setInternalCols(updated);
        }
        onColResize?.(updated);
      }
    }

    if (activeDrag.type === 'row' || activeDrag.type === 'intersection') {
      const rowIdx = activeDrag.type === 'row' ? activeDrag.index : activeDrag.rowIndex;
      if (height > 0) {
        const deltaY = e.clientY - startY;
        const deltaPercent = (deltaY / height) * 100;
        const minPercent = (minRowSize / height) * 100;

        const pairTotal = initialRows[rowIdx] + initialRows[rowIdx + 1];
        let newTop = initialRows[rowIdx] + deltaPercent;

        if (newTop < minPercent) newTop = minPercent;
        if (newTop > pairTotal - minPercent) newTop = pairTotal - minPercent;

        const newBottom = pairTotal - newTop;

        const updated = [...initialRows];
        updated[rowIdx] = newTop;
        updated[rowIdx + 1] = newBottom;

        if (!controlledRowSizes) {
          setInternalRows(updated);
        }
        onRowResize?.(updated);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeDrag) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
      setActiveDrag(null);
      dragStartRef.current = null;
    }
  };

  // Reset helpers
  const handleResetCol = (colIndex: number) => {
    if (!allowReset) return;
    const updated = [...activeCols];
    const pair = updated[colIndex] + updated[colIndex + 1];
    updated[colIndex] = pair / 2;
    updated[colIndex + 1] = pair / 2;
    if (!controlledColSizes) setInternalCols(updated);
    onColResize?.(updated);
  };

  const handleResetRow = (rowIndex: number) => {
    if (!allowReset) return;
    const updated = [...activeRows];
    const pair = updated[rowIndex] + updated[rowIndex + 1];
    updated[rowIndex] = pair / 2;
    updated[rowIndex + 1] = pair / 2;
    if (!controlledRowSizes) setInternalRows(updated);
    onRowResize?.(updated);
  };

  const handleResetIntersection = (colIndex: number, rowIndex: number) => {
    handleResetCol(colIndex);
    handleResetRow(rowIndex);
  };

  // Prefix sums for positioning
  const colPrefixSums = [0];
  for (let i = 0; i < activeCols.length; i++) {
    colPrefixSums.push(colPrefixSums[i] + activeCols[i]);
  }

  const rowPrefixSums = [0];
  for (let i = 0; i < activeRows.length; i++) {
    rowPrefixSums.push(rowPrefixSums[i] + activeRows[i]);
  }

  const childArray = Children.toArray(children).filter(isValidElement);

  return (
    <div
      ref={containerRef}
      className={`ts-split-grid ${className}`.trim()}
      style={style}
    >
      {/* Cells */}
      {childArray.map((child, index) => {
        const props = (child.props as SplitGridCellProps) || {};
        const row = props.row !== undefined ? props.row : Math.floor(index / columns);
        const col = props.col !== undefined ? props.col : index % columns;
        const rowSpan = props.rowSpan || 1;
        const colSpan = props.colSpan || 1;

        const top = rowPrefixSums[row] ?? 0;
        const left = colPrefixSums[col] ?? 0;

        const bottomIndex = Math.min(row + rowSpan, rows);
        const rightIndex = Math.min(col + colSpan, columns);

        const height = (rowPrefixSums[bottomIndex] ?? 100) - top;
        const width = (colPrefixSums[rightIndex] ?? 100) - left;

        return (
          <div
            key={index}
            className="ts-split-grid-cell-wrapper"
            style={{
              position: 'absolute',
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {child}
          </div>
        );
      })}

      {/* Column Gutters */}
      {Array.from({ length: columns - 1 }, (_, c) => {
        const leftPercent = colPrefixSums[c + 1];
        const isDragging =
          activeDrag?.type === 'col' && activeDrag.index === c;

        return (
          <div
            key={`col-gutter-${c}`}
            className={[
              'ts-split-grid-gutter-col',
              isDragging ? 'ts-split-grid-gutter-col--dragging' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ left: `${leftPercent}%` }}
            onPointerDown={(e) => handlePointerDownCol(c, e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={() => handleResetCol(c)}
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize column ${c + 1} and ${c + 2}`}
          />
        );
      })}

      {/* Row Gutters */}
      {Array.from({ length: rows - 1 }, (_, r) => {
        const topPercent = rowPrefixSums[r + 1];
        const isDragging =
          activeDrag?.type === 'row' && activeDrag.index === r;

        return (
          <div
            key={`row-gutter-${r}`}
            className={[
              'ts-split-grid-gutter-row',
              isDragging ? 'ts-split-grid-gutter-row--dragging' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ top: `${topPercent}%` }}
            onPointerDown={(e) => handlePointerDownRow(r, e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={() => handleResetRow(r)}
            role="separator"
            aria-orientation="horizontal"
            aria-label={`Resize row ${r + 1} and ${r + 2}`}
          />
        );
      })}

      {/* Intersection Handles */}
      {Array.from({ length: rows - 1 }, (_, r) =>
        Array.from({ length: columns - 1 }, (_, c) => {
          const leftPercent = colPrefixSums[c + 1];
          const topPercent = rowPrefixSums[r + 1];
          const isDragging =
            activeDrag?.type === 'intersection' &&
            activeDrag.colIndex === c &&
            activeDrag.rowIndex === r;

          return (
            <div
              key={`intersection-${r}-${c}`}
              className={[
                'ts-split-grid-intersection',
                isDragging ? 'ts-split-grid-intersection--dragging' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
              }}
              onPointerDown={(e) => handlePointerDownIntersection(c, r, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={() => handleResetIntersection(c, r)}
              title="Drag to resize row & column simultaneously. Double-click to equalize."
            />
          );
        })
      )}
    </div>
  );
};

SplitGrid.displayName = 'SplitGrid';
