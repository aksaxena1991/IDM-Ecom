import React, { createContext, useContext, useState, useId } from 'react';
import './Panel.css';
import { ChevronDown } from 'lucide-react';

interface PanelGroupContextValue {
  expandedIds: string[];
  togglePanel: (id: string) => void;
  allowMultiple?: boolean;
}

const PanelGroupContext = createContext<PanelGroupContextValue | undefined>(undefined);

export interface PanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Allow multiple panels to be open simultaneously */
  allowMultiple?: boolean;
  /** Controlled expanded panel ids */
  value?: string[];
  /** Default expanded panel ids */
  defaultValue?: string[];
  /** Callback fired when expanded panels change */
  onValueChange?: (ids: string[]) => void;
  children: React.ReactNode;
}

/**
 * ThoughtStream PanelGroup (Iterative Panels)
 *
 * Coordinates stacked, sequential or collapsible contemplative panels
 * with 0px geometry, flat surfaces, and hairline dividers.
 */
export const PanelGroup: React.FC<PanelGroupProps> = ({
  allowMultiple = false,
  value,
  defaultValue = [],
  onValueChange,
  children,
  className = '',
  ...props
}) => {
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultValue);
  const expandedIds = value !== undefined ? value : internalExpanded;

  const togglePanel = (id: string) => {
    let nextIds: string[];
    if (expandedIds.includes(id)) {
      nextIds = expandedIds.filter((item) => item !== id);
    } else {
      nextIds = allowMultiple ? [...expandedIds, id] : [id];
    }

    if (value === undefined) {
      setInternalExpanded(nextIds);
    }
    onValueChange?.(nextIds);
  };

  return (
    <PanelGroupContext.Provider value={{ expandedIds, togglePanel, allowMultiple }}>
      <div className={`ts-panel-group ${className}`.trim()} {...props}>
        {children}
      </div>
    </PanelGroupContext.Provider>
  );
};
PanelGroup.displayName = 'PanelGroup';

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Unique ID for panel (auto-generated if omitted) */
  id?: string;
  /** Numeric step or chapter indicator (e.g. 1, 2, "01", etc.) */
  step?: React.ReactNode;
  /** Primary panel heading */
  title: React.ReactNode;
  /** Secondary subtitle / byline */
  subtitle?: React.ReactNode;
  /** Trailing metadata or status badge */
  trailing?: React.ReactNode;
  /** Panel content */
  children: React.ReactNode;
  /** Controlled open state (overrides context if provided) */
  isOpen?: boolean;
  /** Callback on header toggle click */
  onToggle?: () => void;
}

export const Panel: React.FC<PanelProps> = ({
  id,
  step,
  title,
  subtitle,
  trailing,
  children,
  isOpen,
  onToggle,
  className = '',
  ...props
}) => {
  const autoId = useId();
  const panelId = id || autoId;
  const context = useContext(PanelGroupContext);

  const isExpanded =
    isOpen !== undefined
      ? isOpen
      : context
      ? context.expandedIds.includes(panelId)
      : false;

  const handleToggle = () => {
    onToggle?.();
    if (context) {
      context.togglePanel(panelId);
    }
  };

  const headerId = `${panelId}-header`;
  const contentId = `${panelId}-content`;

  return (
    <div
      className={`ts-panel ${isExpanded ? 'ts-panel--expanded' : ''} ${className}`.trim()}
      {...props}
    >
      <div className="ts-panel-header">
        <button
          type="button"
          id={headerId}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          className="ts-panel-toggle"
          onClick={handleToggle}
        >
          <div className="ts-panel-header-left">
            {step !== undefined && (
              <span
                className={`ts-panel-index ${isExpanded ? 'ts-panel-index--active' : ''}`}
                aria-hidden="true"
              >
                {step}
              </span>
            )}
            <div className="ts-panel-title-group">
              <h4 className="ts-panel-title">{title}</h4>
              {subtitle && <p className="ts-panel-subtitle">{subtitle}</p>}
            </div>
          </div>
        </button>

        {trailing != null && <div className="ts-panel-header-actions">{trailing}</div>}

        <button
          type="button"
          className="ts-panel-chevron-btn"
          tabIndex={-1}
          aria-hidden="true"
          onClick={handleToggle}
        >
          <span className={`ts-panel-chevron ${isExpanded ? 'ts-panel-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </button>
      </div>

      {isExpanded && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className="ts-panel-body"
        >
          {children}
        </div>
      )}
    </div>
  );
};
Panel.displayName = 'Panel';
