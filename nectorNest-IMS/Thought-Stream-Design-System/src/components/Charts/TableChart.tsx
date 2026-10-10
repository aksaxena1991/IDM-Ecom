import React, { useState } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface TableChartColumn<T = any> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  type?: 'text' | 'number' | 'bar' | 'sparkline' | 'badge';
  width?: string | number;
  max?: number; // For 'bar' type scaling
  formatter?: (value: any, row: T) => React.ReactNode;
}

export interface TableChartProps<T = any> {
  columns: TableChartColumn<T>[];
  data: T[];
  title?: string;
  subtitle?: string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a table row is clicked */
  onRowClick?: (row: T, index: number) => void;
  /** Callback fired when a specific cell is clicked */
  onCellClick?: (value: any, columnKey: string, row: T) => void;
}

/**
 * ThoughtStream TableChart Component
 *
 * Minimalist analytical data table chart with embedded micro-bars,
 * monospace metric typography, hairline borders, and tooltips.
 */
export function TableChart<T extends Record<string, any>>({
  columns,
  data,
  title,
  subtitle,
  borderless = false,
  className = '',
  style,
  onRowClick,
  onCellClick,
}: TableChartProps<T>) {
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    items: ChartTooltipItem[];
  }>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    items: [],
  });

  return (
    <div
      className={`ts-chart-container ${borderless ? 'ts-chart-container--borderless' : ''} ${className}`.trim()}
      style={style}
    >
      {(title || subtitle) && (
        <div className="ts-chart-header">
          <div className="ts-chart-title-group">
            {title && <h4 className="ts-chart-title">{title}</h4>}
            {subtitle && <p className="ts-chart-subtitle">{subtitle}</p>}
          </div>
        </div>
      )}

      <div className="ts-chart-table-wrap">
        <table className="ts-chart-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: col.align || (col.type === 'number' || col.type === 'bar' ? 'right' : 'left'),
                    width: col.width,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                style={{ cursor: onRowClick ? 'pointer' : undefined }}
                onClick={() => onRowClick?.(row, rowIdx)}
              >
                {columns.map((col) => {
                  const val = row[col.key];
                  const align = col.align || (col.type === 'number' || col.type === 'bar' ? 'right' : 'left');

                  if (col.type === 'bar') {
                    const numVal = Number(val ?? 0);
                    const maxVal = col.max || 100;
                    const pct = Math.min(100, Math.max(0, (numVal / maxVal) * 100));

                    return (
                      <td
                        key={col.key}
                        style={{ textAlign: align, minWidth: '140px' }}
                        onClick={(e) => {
                          if (onCellClick) {
                            e.stopPropagation();
                            onCellClick(val, col.key, row);
                          }
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipState({
                            visible: true,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            title: col.header,
                            items: [
                              {
                                label: row.name || `Row ${rowIdx + 1}`,
                                value: numVal,
                                formattedValue: `${numVal.toLocaleString()} (${pct.toFixed(0)}%)`,
                                color: '#1C1917',
                              },
                            ],
                          });
                        }}
                        onMouseLeave={() =>
                          setTooltipState((prev) => ({ ...prev, visible: false }))
                        }
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--ts-font-mono)',
                              fontSize: '12px',
                              minWidth: '40px',
                            }}
                          >
                            {col.formatter ? col.formatter(val, row) : numVal.toLocaleString()}
                          </span>
                          <div className="ts-chart-table-bar-bg" style={{ width: '80px' }}>
                            <div
                              className="ts-chart-table-bar-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  }

                  if (col.type === 'sparkline' && Array.isArray(val)) {
                    // Render miniature pure SVG sparkline
                    const sparkWidth = 64;
                    const sparkHeight = 18;
                    const min = Math.min(...val);
                    const max = Math.max(...val);
                    const spread = max - min || 1;

                    const points = val
                      .map((v: number, i: number) => {
                        const x = (i / (val.length - 1 || 1)) * sparkWidth;
                        const y = sparkHeight - ((v - min) / spread) * (sparkHeight - 4) - 2;
                        return `${x},${y}`;
                      })
                      .join(' ');

                    return (
                      <td
                        key={col.key}
                        style={{ textAlign: align }}
                        onClick={(e) => {
                          if (onCellClick) {
                            e.stopPropagation();
                            onCellClick(val, col.key, row);
                          }
                        }}
                      >
                        <svg
                          width={sparkWidth}
                          height={sparkHeight}
                          style={{ display: 'inline-block', verticalAlign: 'middle' }}
                        >
                          <polyline
                            points={points}
                            fill="none"
                            stroke="#1C1917"
                            strokeWidth={1.5}
                          />
                        </svg>
                      </td>
                    );
                  }

                  if (col.type === 'number') {
                    return (
                      <td
                        key={col.key}
                        style={{
                          textAlign: align,
                          fontFamily: 'var(--ts-font-mono)',
                          fontSize: '12px',
                        }}
                        onClick={(e) => {
                          if (onCellClick) {
                            e.stopPropagation();
                            onCellClick(val, col.key, row);
                          }
                        }}
                      >
                        {col.formatter
                          ? col.formatter(val, row)
                          : typeof val === 'number'
                          ? val.toLocaleString()
                          : val}
                      </td>
                    );
                  }

                  if (col.type === 'badge') {
                    return (
                      <td
                        key={col.key}
                        style={{ textAlign: align }}
                        onClick={(e) => {
                          if (onCellClick) {
                            e.stopPropagation();
                            onCellClick(val, col.key, row);
                          }
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            fontSize: '10px',
                            fontFamily: 'var(--ts-font-mono)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            border: '1px solid var(--ts-border-subtle)',
                            backgroundColor: 'var(--ts-color-bg-subtle)',
                            color: 'var(--ts-color-text-secondary)',
                          }}
                        >
                          {col.formatter ? col.formatter(val, row) : String(val)}
                        </span>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      style={{ textAlign: align }}
                      onClick={(e) => {
                        if (onCellClick) {
                          e.stopPropagation();
                          onCellClick(val, col.key, row);
                        }
                      }}
                    >
                      {col.formatter ? col.formatter(val, row) : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ChartTooltip
        x={tooltipState.x}
        y={tooltipState.y}
        title={tooltipState.title}
        items={tooltipState.items}
        visible={tooltipState.visible}
      />
    </div>
  );
}

TableChart.displayName = 'TableChart';
