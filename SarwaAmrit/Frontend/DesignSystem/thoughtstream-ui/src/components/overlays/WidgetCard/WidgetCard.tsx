import React, { useState } from 'react';
import { ChevronDown, Grip, Maximize2, MoreVertical, X } from 'lucide-react';
import { Dropdown, DropdownItem } from '../Dropdown';
import './WidgetCard.css';

export interface WidgetRangeOption {
  value: string;
  label: string;
}

export interface WidgetCardProps {
  /** Widget title */
  title: string;
  /** Supporting line under the title */
  subtitle?: string;
  /** Icon shown beside the title */
  icon?: React.ReactNode;
  /** Chart or summary rendered in the card body */
  children: React.ReactNode;
  /** Shows the edit frame: accent border and the drag, expand, and remove tools */
  editing?: boolean;
  /** Removes the widget from the board */
  onRemove?: () => void;
  /** Expands the widget across the board */
  onExpand?: () => void;
  /** True when this card currently spans the board */
  expanded?: boolean;
  /** Called when the drag grip is pressed, so the board can start a reorder */
  onDragGripPointerDown?: () => void;
  /** Called when the grip is released */
  onDragGripPointerUp?: () => void;
  /** Time-range choices. Hidden when omitted. */
  rangeOptions?: WidgetRangeOption[];
  /** Selected time range */
  rangeValue?: string;
  /** Fired when the time range changes */
  onRangeChange?: (value: string) => void;
  className?: string;
}

/**
 * Dashboard widget frame.
 *
 * Matches the analytics card: title and subtitle, a range menu, an overflow
 * menu, and — while editing — a grip, expand, and remove control sitting on
 * the top edge.
 */
export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  editing = false,
  onRemove,
  onExpand,
  expanded = false,
  onDragGripPointerDown,
  onDragGripPointerUp,
  rangeOptions,
  rangeValue,
  onRangeChange,
  className = '',
}) => {
  const [uncontrolledRange, setUncontrolledRange] = useState(
    rangeOptions?.[0]?.value ?? ''
  );
  const selectedRange = rangeValue ?? uncontrolledRange;

  const setRange = (next: string) => {
    if (rangeValue === undefined) setUncontrolledRange(next);
    onRangeChange?.(next);
  };

  return (
    <section
      className={[
        'ts-widget-card',
        editing ? 'ts-widget-card--editing' : '',
        expanded ? 'ts-widget-card--expanded' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={title}
    >
      {editing && (
        <div className="ts-widget-card-toolbar" role="toolbar" aria-label={`${title} tools`}>
          <button
            type="button"
            className="ts-widget-card-tool"
            aria-label={`Drag ${title}`}
            onMouseDown={onDragGripPointerDown}
            onMouseUp={onDragGripPointerUp}
            onTouchStart={onDragGripPointerDown}
            onTouchEnd={onDragGripPointerUp}
          >
            <Grip size={14} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="ts-widget-card-tool"
            aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
            aria-pressed={expanded}
            onClick={onExpand}
          >
            <Maximize2 size={14} strokeWidth={1.75} />
          </button>
          {onRemove && (
            <button
              type="button"
              className="ts-widget-card-tool"
              aria-label={`Remove ${title}`}
              onClick={onRemove}
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>
      )}

      <header className="ts-widget-card-header">
        <div className="ts-widget-card-heading">
          <div className="ts-widget-card-title-row">
            {icon && (
              <span className="ts-widget-card-title-icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <h3 className="ts-widget-card-title">{title}</h3>
          </div>
          {subtitle && <p className="ts-widget-card-subtitle">{subtitle}</p>}
        </div>

        <div className="ts-widget-card-controls">
          {rangeOptions && rangeOptions.length > 0 && (
            <label className="ts-widget-card-range">
              <span className="ts-widget-card-sr">{title} time range</span>
              <select
                className="ts-widget-card-range-select"
                value={selectedRange}
                onChange={(event) => setRange(event.target.value)}
              >
                {rangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />
            </label>
          )}

          {onRemove && (
            <Dropdown
              placement="bottom-end"
              trigger={
                <button
                  type="button"
                  className="ts-widget-card-more"
                  aria-label={`${title} actions`}
                >
                  <MoreVertical size={16} strokeWidth={1.75} />
                </button>
              }
            >
              <DropdownItem destructive onClick={onRemove}>
                Remove widget
              </DropdownItem>
            </Dropdown>
          )}
        </div>
      </header>

      <div className="ts-widget-card-body">{children}</div>
    </section>
  );
};

WidgetCard.displayName = 'WidgetCard';
