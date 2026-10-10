import React, {
  useState,
  useRef,
  useCallback,
  Children,
  isValidElement,
  useEffect,
} from 'react';
import './SplitScreen.css';

export type SplitDirection = 'horizontal' | 'vertical';

export interface SplitPaneProps {
  /** Initial size (percentage or pixel) */
  defaultSize?: number;
  /** Minimum allowable size in pixels */
  minSize?: number;
  /** Maximum allowable size in pixels */
  maxSize?: number;
  /** Whether this pane is collapsed */
  collapsed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div className={`ts-split-pane ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

SplitPane.displayName = 'SplitPane';

export interface SplitScreenProps {
  /** Layout direction: 'horizontal' (columns) or 'vertical' (rows) */
  direction?: SplitDirection;
  /** Default percentage shares for each pane (e.g. [20, 50, 30] summing to 100) */
  defaultSizes?: number[];
  /** Controlled percentage shares for each pane */
  sizes?: number[];
  /** Callback fired when pane sizes change */
  onResize?: (sizes: number[]) => void;
  /** Minimum size in pixels for panes (array per pane or single number applied to all) */
  minSize?: number | number[];
  /** Allow double-clicking gutters to equalize sizes */
  allowReset?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * ThoughtStream SplitScreen (Multi Split Screen) Component
 *
 * Provides a responsive multi-pane resizable layout with 0px geometry,
 * hairline dividers, smooth pointer tracking, and horizontal/vertical orientations.
 */
export const SplitScreen: React.FC<SplitScreenProps> = ({
  direction = 'horizontal',
  defaultSizes,
  sizes: controlledSizes,
  onResize,
  minSize = 80,
  allowReset = true,
  className = '',
  style,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const childArray = Children.toArray(children).filter(isValidElement);
  const paneCount = childArray.length;

  // Initialize even percentages if defaultSizes is not specified
  const initialSizes = defaultSizes && defaultSizes.length === paneCount
    ? defaultSizes
    : Array(paneCount).fill(100 / (paneCount || 1));

  const [internalSizes, setInternalSizes] = useState<number[]>(initialSizes);
  const activeSizes = controlledSizes || internalSizes;

  // Keep internalSizes matched to pane count if children change
  useEffect(() => {
    if (activeSizes.length !== paneCount && paneCount > 0) {
      const even = Array(paneCount).fill(100 / paneCount);
      setInternalSizes(even);
    }
  }, [paneCount, activeSizes.length]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragStartRef = useRef<{
    index: number;
    startPos: number;
    initialSizes: number[];
    containerSize: number;
  } | null>(null);

  const getMinSizeForIndex = useCallback((index: number) => {
    if (Array.isArray(minSize)) {
      return minSize[index] ?? 60;
    }
    return minSize;
  }, [minSize]);

  const handlePointerDown = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = containerRef.current.getBoundingClientRect();
    const containerSize = direction === 'horizontal' ? rect.width : rect.height;
    const startPos = direction === 'horizontal' ? e.clientX : e.clientY;

    dragStartRef.current = {
      index,
      startPos,
      initialSizes: [...activeSizes],
      containerSize,
    };
    setDraggingIndex(index);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIndex === null || !dragStartRef.current || !containerRef.current) return;

    const { index, startPos, initialSizes, containerSize } = dragStartRef.current;
    if (containerSize <= 0) return;

    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const deltaPixels = currentPos - startPos;
    const deltaPercent = (deltaPixels / containerSize) * 100;

    const leftMinPx = getMinSizeForIndex(index);
    const rightMinPx = getMinSizeForIndex(index + 1);

    const leftMinPercent = (leftMinPx / containerSize) * 100;
    const rightMinPercent = (rightMinPx / containerSize) * 100;

    const currentLeft = initialSizes[index];
    const currentRight = initialSizes[index + 1];

    let newLeft = currentLeft + deltaPercent;
    let newRight = currentRight - deltaPercent;

    if (newLeft < leftMinPercent) {
      newLeft = leftMinPercent;
      newRight = currentLeft + currentRight - leftMinPercent;
    } else if (newRight < rightMinPercent) {
      newRight = rightMinPercent;
      newLeft = currentLeft + currentRight - rightMinPercent;
    }

    const updatedSizes = [...initialSizes];
    updatedSizes[index] = newLeft;
    updatedSizes[index + 1] = newRight;

    if (!controlledSizes) {
      setInternalSizes(updatedSizes);
    }
    onResize?.(updatedSizes);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIndex !== null) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
      setDraggingIndex(null);
      dragStartRef.current = null;
    }
  };

  const handleDoubleClickGutter = (index: number) => {
    if (!allowReset) return;
    const updated = [...activeSizes];
    const totalPair = updated[index] + updated[index + 1];
    const half = totalPair / 2;
    updated[index] = half;
    updated[index + 1] = half;

    if (!controlledSizes) {
      setInternalSizes(updated);
    }
    onResize?.(updated);
  };

  return (
    <div
      ref={containerRef}
      className={`ts-split-screen ts-split-screen--${direction} ${className}`.trim()}
      style={style}
    >
      {childArray.map((child, index) => {
        const sizePercent = activeSizes[index] ?? 100 / paneCount;
        const flexBasis = `${sizePercent}%`;

        return (
          <React.Fragment key={index}>
            <div
              className="ts-split-pane-wrapper"
              style={{
                flex: `0 0 ${flexBasis}`,
                maxWidth: flexBasis,
                minWidth: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {child}
            </div>

            {index < paneCount - 1 && (
              <div
                role="separator"
                aria-orientation={direction}
                aria-label={`Resize pane ${index + 1} and ${index + 2}`}
                className={[
                  'ts-split-resizer',
                  draggingIndex === index ? 'ts-split-resizer--dragging' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onPointerDown={(e) => handlePointerDown(index, e)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onDoubleClick={() => handleDoubleClickGutter(index)}
              >
                <div className="ts-split-resizer-handle" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

SplitScreen.displayName = 'SplitScreen';
