import React, {
  useState,
  forwardRef,
  createContext,
  useContext,
} from 'react';
import './Sidebar.css';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  children?: SidebarNavItem[];
  onClick?: () => void;
}

export interface SidebarNavGroup {
  id?: string;
  title?: string;
  items: SidebarNavItem[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Controlled collapsed state (icon-only mode) */
  collapsed?: boolean;
  /** Initial collapsed state for uncontrolled usage */
  defaultCollapsed?: boolean;
  /** Callback fired when collapsed state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Whether user can collapse/expand the sidebar */
  collapsible?: boolean;
  /** Width when expanded (e.g. 260, '16rem') */
  width?: number | string;
  /** Width when collapsed into icon rail (e.g. 64, '4rem') */
  collapsedWidth?: number | string;
  /** Position on screen: left or right */
  position?: 'left' | 'right';
  /** Structured groups of navigation items */
  groups?: SidebarNavGroup[];
  /** Header slot (brand, workspace switcher, emblem) */
  header?: React.ReactNode;
  /** Footer slot (user profile, telemetry, theme switch) */
  footer?: React.ReactNode;
  /** Global item click listener */
  onItemClick?: (item: SidebarNavItem) => void;
  children?: React.ReactNode;
}

interface SidebarContextValue {
  collapsed: boolean;
  onItemClick?: (item: SidebarNavItem) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
});

/**
 * ThoughtStream Sidebar Component
 *
 * Contemplative vertical navigation sidebar supporting expanded and
 * compact icon-rail modes with 0px geometry, hairline borders,
 * group taxonomies, and floating tooltips.
 */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      collapsed: controlledCollapsed,
      defaultCollapsed = false,
      onCollapseChange,
      collapsible = true,
      width = 260,
      collapsedWidth = 64,
      position = 'left',
      groups = [],
      header,
      footer,
      onItemClick,
      children,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
    const isCollapsed =
      controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

    const toggleCollapse = () => {
      if (!collapsible) return;
      const next = !isCollapsed;
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(next);
      }
      onCollapseChange?.(next);
    };

    const currentWidth = isCollapsed ? collapsedWidth : width;

    const classes = [
      'ts-sidebar',
      `ts-sidebar--${position}`,
      isCollapsed ? 'ts-sidebar--collapsed' : 'ts-sidebar--expanded',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const computedStyle: React.CSSProperties = {
      ...style,
      width: typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth,
      minWidth: typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth,
    };

    return (
      <SidebarContext.Provider value={{ collapsed: isCollapsed, onItemClick }}>
        <aside
          ref={ref}
          className={classes}
          style={computedStyle}
          role="navigation"
          aria-label="Sidebar Navigation"
          {...props}
        >
          {/* Header Area */}
          {(header || collapsible) && (
            <div className="ts-sidebar__header">
              <div className="ts-sidebar__header-content">
                {!isCollapsed && header}
                {isCollapsed && (
                  <div className="ts-sidebar__header-collapsed-emblem">
                    {/* Render simplified emblem or first letter if collapsed */}
                    {header ? (
                      <div className="ts-sidebar__header-icon-wrap">{header}</div>
                    ) : null}
                  </div>
                )}
              </div>

              {collapsible && (
                <button
                  type="button"
                  className="ts-sidebar__collapse-btn"
                  onClick={toggleCollapse}
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {position === 'left' ? (
                    isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />
                  ) : (
                    isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />
                  )}
                </button>
              )}
            </div>
          )}

          {/* Navigation Body */}
          <div className="ts-sidebar__body">
            {groups.map((group, gIdx) => (
              <SidebarGroupSection key={group.id || gIdx} group={group} />
            ))}
            {children}
          </div>

          {/* Footer Area */}
          {footer && (
            <div className="ts-sidebar__footer">
              {footer}
            </div>
          )}
        </aside>
      </SidebarContext.Provider>
    );
  }
);
Sidebar.displayName = 'Sidebar';

/* ==========================================================================
   Sidebar Group Section
   ========================================================================== */
interface SidebarGroupSectionProps {
  group: SidebarNavGroup;
}

const SidebarGroupSection: React.FC<SidebarGroupSectionProps> = ({ group }) => {
  const { collapsed } = useContext(SidebarContext);

  return (
    <div className="ts-sidebar__group">
      {group.title && !collapsed && (
        <div className="ts-sidebar__group-title">{group.title}</div>
      )}
      <ul className="ts-sidebar__list">
        {group.items.map((item) => (
          <SidebarItemRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
};

/* ==========================================================================
   Sidebar Item Row
   ========================================================================== */
interface SidebarItemRowProps {
  item: SidebarNavItem;
}

const SidebarItemRow: React.FC<SidebarItemRowProps> = ({ item }) => {
  const { collapsed, onItemClick } = useContext(SidebarContext);
  const [subOpen, setSubOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (item.disabled) return;
    if (hasChildren && !collapsed) {
      e.preventDefault();
      setSubOpen((prev) => !prev);
    } else {
      item.onClick?.();
      onItemClick?.(item);
    }
  };

  const classes = [
    'ts-sidebar__item',
    item.active ? 'ts-sidebar__item--active' : '',
    item.disabled ? 'ts-sidebar__item--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className="ts-sidebar__item-container">
      <button
        type="button"
        className={classes}
        disabled={item.disabled}
        onClick={handleClick}
        aria-expanded={hasChildren ? subOpen : undefined}
      >
        {item.icon && <span className="ts-sidebar__item-icon">{item.icon}</span>}

        {!collapsed && (
          <>
            <span className="ts-sidebar__item-label">{item.label}</span>
            {item.badge && <span className="ts-sidebar__item-badge">{item.badge}</span>}
            {hasChildren && (
              <ChevronDown
                className={[
                  'ts-sidebar__chevron',
                  subOpen ? 'ts-sidebar__chevron--open' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                size={14}
              />
            )}
          </>
        )}

        {/* Floating Tooltip Label in Collapsed Mode */}
        {collapsed && (
          <span className="ts-sidebar__tooltip" role="tooltip">
            {item.label}
            {item.badge && <span className="ts-sidebar__tooltip-badge">{item.badge}</span>}
          </span>
        )}
      </button>

      {/* Sub Items (Only visible in expanded mode) */}
      {!collapsed && hasChildren && subOpen && (
        <ul className="ts-sidebar__sublist">
          {item.children?.map((sub) => (
            <li key={sub.id} className="ts-sidebar__subitem-container">
              <button
                type="button"
                className={[
                  'ts-sidebar__subitem',
                  sub.active ? 'ts-sidebar__subitem--active' : '',
                  sub.disabled ? 'ts-sidebar__subitem--disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={sub.disabled}
                onClick={() => {
                  if (!sub.disabled) {
                    sub.onClick?.();
                    onItemClick?.(sub);
                  }
                }}
              >
                {sub.icon && <span className="ts-sidebar__item-icon">{sub.icon}</span>}
                <span className="ts-sidebar__item-label">{sub.label}</span>
                {sub.badge && <span className="ts-sidebar__item-badge">{sub.badge}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};
