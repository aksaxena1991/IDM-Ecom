import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface GanttTask {
  id: string;
  label: string;
  start: number; // Day index or numeric offset (0-indexed)
  end: number;   // Day index or numeric offset
  progress?: number; // 0 to 100
  color?: string;
  category?: string;
}

export interface GanttChartProps {
  tasks: GanttTask[];
  totalDays?: number;
  timeLabels?: string[];
  today?: number;
  title?: string;
  subtitle?: string;
  rowHeight?: number;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a task milestone bar is clicked */
  onTaskClick?: (task: GanttTask) => void;
}

const DEFAULT_BAR_COLOR = '#1C1917';

/**
 * ThoughtStream GanttChart Component
 *
 * Minimalist pure SVG project timeline & task scheduling chart
 * with 0px sharp rectangular bars, progress fills, and tooltips.
 */
export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  totalDays: propTotalDays,
  timeLabels,
  today,
  title,
  subtitle,
  rowHeight = 36,
  borderless = false,
  className = '',
  style,
  onTaskClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const labelColumnWidth = 140;
  const paddingRight = 20;
  const headerHeight = 32;

  const calculatedMaxDay = Math.max(...tasks.map((t) => t.end), 10);
  const totalDays = propTotalDays || calculatedMaxDay + 1;

  const chartWidth = 720;
  const chartHeight = headerHeight + tasks.length * rowHeight + 20;

  const timelineWidth = chartWidth - labelColumnWidth - paddingRight;
  const dayWidth = timelineWidth / totalDays;

  const activeTask = hoveredTaskId ? tasks.find((t) => t.id === hoveredTaskId) : null;

  const tooltipItems: ChartTooltipItem[] = activeTask
    ? [
        {
          label: 'Duration',
          value: `${activeTask.end - activeTask.start + 1} days`,
          color: activeTask.color || DEFAULT_BAR_COLOR,
        },
        ...(activeTask.progress !== undefined
          ? [
              {
                label: 'Progress',
                value: `${activeTask.progress}%`,
                color: activeTask.color || DEFAULT_BAR_COLOR,
              },
            ]
          : []),
      ]
    : [];

  return (
    <div
      ref={containerRef}
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

      <div className="ts-chart-canvas-wrapper">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="ts-chart-svg"
          style={{ width: '100%', minWidth: '580px' }}
        >
          {/* Header Background */}
          <rect
            x={0}
            y={0}
            width={chartWidth}
            height={headerHeight}
            fill="var(--ts-color-bg-subtle)"
          />
          <line
            x1={0}
            y1={headerHeight}
            x2={chartWidth}
            y2={headerHeight}
            stroke="var(--ts-border-subtle)"
            strokeWidth={1}
          />

          {/* Task Header Title */}
          <text
            x={12}
            y={headerHeight / 2 + 4}
            className="ts-chart-axis-tick"
            style={{ fontWeight: 600, fill: 'var(--ts-color-text-secondary)' }}
          >
            TASK / MILESTONE
          </text>

          {/* Timeline Grid & Header Day Ticks */}
          {Array.from({ length: totalDays }, (_, day) => {
            const x = labelColumnWidth + day * dayWidth;
            const label = timeLabels?.[day] || `D${day + 1}`;

            return (
              <g key={`grid-day-${day}`}>
                {/* Vertical Day Gridline */}
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={chartHeight}
                  stroke="var(--ts-border-subtle)"
                  strokeWidth={0.5}
                  strokeDasharray="2 3"
                />

                {/* Day Header Label */}
                <text
                  x={x + dayWidth / 2}
                  y={headerHeight / 2 + 4}
                  textAnchor="middle"
                  className="ts-chart-axis-tick"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Today Indicator Line */}
          {today !== undefined && (
            <line
              x1={labelColumnWidth + today * dayWidth + dayWidth / 2}
              y1={0}
              x2={labelColumnWidth + today * dayWidth + dayWidth / 2}
              y2={chartHeight}
              className="ts-chart-gantt-today"
            />
          )}

          {/* Task Rows */}
          {tasks.map((task, idx) => {
            const rowY = headerHeight + idx * rowHeight;
            const barX = labelColumnWidth + task.start * dayWidth;
            const barW = Math.max(4, (task.end - task.start + 1) * dayWidth - 4);
            const barH = rowHeight - 12;
            const barY = rowY + 6;
            const isHovered = hoveredTaskId === task.id;
            const color = task.color || DEFAULT_BAR_COLOR;

            return (
              <g key={task.id} className="ts-chart-gantt-row">
                {/* Row Alternate Background */}
                {idx % 2 === 1 && (
                  <rect
                    x={0}
                    y={rowY}
                    width={chartWidth}
                    height={rowHeight}
                    fill="var(--ts-color-bg-subtle)"
                    opacity={0.4}
                  />
                )}

                {/* Task Label */}
                <text
                  x={12}
                  y={rowY + rowHeight / 2 + 4}
                  className="ts-chart-axis-tick"
                  style={{
                    fill: isHovered ? 'var(--ts-color-text-primary)' : 'var(--ts-color-text-secondary)',
                    fontWeight: isHovered ? 600 : 400,
                  }}
                >
                  {task.label}
                </text>

                {/* Gantt Milestone / Task Bar */}
                <g
                  className="ts-chart-gantt-bar"
                  onClick={() => onTaskClick?.(task)}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoveredTaskId(task.id);
                      setTooltipPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setTooltipPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredTaskId(null)}
                >
                  {/* Task Bar Background */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barW}
                    height={barH}
                    fill={color}
                    opacity={0.2}
                    stroke={color}
                    strokeWidth={1}
                  />

                  {/* Progress Shading */}
                  {task.progress !== undefined && task.progress > 0 && (
                    <rect
                      x={barX}
                      y={barY}
                      width={barW * Math.min(1, task.progress / 100)}
                      height={barH}
                      fill={color}
                    />
                  )}

                  {/* In-bar label if wide enough */}
                  {barW > 60 && (
                    <text
                      x={barX + 8}
                      y={barY + barH / 2 + 3}
                      fill={task.progress && task.progress > 50 ? '#FFFFFF' : 'var(--ts-color-text-primary)'}
                      style={{
                        fontFamily: 'var(--ts-font-mono)',
                        fontSize: '10px',
                        fontWeight: 500,
                        pointerEvents: 'none',
                      }}
                    >
                      {task.progress !== undefined ? `${task.progress}%` : ''}
                    </text>
                  )}
                </g>

                {/* Row Divider */}
                <line
                  x1={0}
                  y1={rowY + rowHeight}
                  x2={chartWidth}
                  y2={rowY + rowHeight}
                  stroke="var(--ts-border-subtle)"
                  strokeWidth={0.5}
                />
              </g>
            );
          })}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={activeTask?.label}
          items={tooltipItems}
          visible={hoveredTaskId !== null}
        />
      </div>
    </div>
  );
};

GanttChart.displayName = 'GanttChart';
