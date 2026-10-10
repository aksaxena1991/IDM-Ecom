import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
} from 'react';
import './MenuBar.css';
import { ChevronDown, Menu as MenuIcon, X } from 'lucide-react';

export type MenuBarSize = 'sm' | 'md' | 'lg';

export interface MenuDropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  dividerAfter?: boolean;
  onClick?: () => void;
}

export interface MenuBarItemConfig {
  id: string;
  label: React.ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children?: MenuDropdownItem[];
  onClick?: () => void;
}

/* ==========================================================================
   MenuBar Component
   ========================================================================== */
export interface MenuBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Brand, logo or wordmark */
  brand?: React.ReactNode;
  /** Menu navigation items */
  items?: MenuBarItemConfig[];
  /** Search input or command palette trigger slot */
  searchSlot?: React.ReactNode;
  /** Trailing actions, CTA buttons or profile slot */
  actionsSlot?: React.ReactNode;
  /** Size scale */
  size?: MenuBarSize;
  /** Show bottom hairline border */
  bordered?: boolean;
  /** Fix to top with backdrop blur */
  sticky?: boolean;
  /** Global item click listener */
  onItemClick?: (item: MenuBarItemConfig | MenuDropdownItem) => void;
  children?: React.ReactNode;
}

export const MenuBar = forwardRef<HTMLElement, MenuBarProps>(
  (
    {
      brand,
      items = [],
      searchSlot,
      actionsSlot,
      size = 'md',
      bordered = true,
      sticky = false,
      onItemClick,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const navRef = useRef<HTMLElement | null>(null);

    // Close open dropdown on outside click
    useEffect(() => {
      const handleDocumentClick = (e: MouseEvent) => {
        if (navRef.current && !navRef.current.contains(e.target as Node)) {
          setOpenDropdownId(null);
        }
      };
      document.addEventListener('mousedown', handleDocumentClick);
      return () => document.removeEventListener('mousedown', handleDocumentClick);
    }, []);

    const toggleDropdown = (id: string) => {
      setOpenDropdownId((prev) => (prev === id ? null : id));
    };

    const handleItemClick = (item: MenuBarItemConfig) => {
      if (item.disabled) return;
      if (item.children && item.children.length > 0) {
        toggleDropdown(item.id);
      } else {
        setOpenDropdownId(null);
        item.onClick?.();
        onItemClick?.(item);
      }
    };

    const handleDropdownSubItemClick = (subItem: MenuDropdownItem) => {
      if (subItem.disabled) return;
      setOpenDropdownId(null);
      subItem.onClick?.();
      onItemClick?.(subItem);
    };

    const classes = [
      'ts-menubar',
      `ts-menubar--${size}`,
      bordered ? 'ts-menubar--bordered' : '',
      sticky ? 'ts-menubar--sticky' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const setRefs = (node: HTMLElement | null) => {
      navRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <header ref={setRefs} className={classes} role="banner" {...props}>
        <div className="ts-menubar__inner">
          {/* Brand Wordmark / Emblem */}
          {brand && <div className="ts-menubar__brand">{brand}</div>}

          {/* Navigation Items */}
          <nav className="ts-menubar__nav" role="navigation" aria-label="Main Navigation">
            {items.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openDropdownId === item.id;

              return (
                <div key={item.id} className="ts-menubar__item-wrapper">
                  <button
                    type="button"
                    className={[
                      'ts-menubar__item',
                      item.active ? 'ts-menubar__item--active' : '',
                      item.disabled ? 'ts-menubar__item--disabled' : '',
                      isOpen ? 'ts-menubar__item--open' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={item.disabled}
                    onClick={() => handleItemClick(item)}
                    aria-expanded={hasChildren ? isOpen : undefined}
                    aria-haspopup={hasChildren ? 'menu' : undefined}
                  >
                    {item.icon && <span className="ts-menubar__item-icon">{item.icon}</span>}
                    <span className="ts-menubar__item-label">{item.label}</span>
                    {item.badge && <span className="ts-menubar__item-badge">{item.badge}</span>}
                    {hasChildren && (
                      <ChevronDown
                        className={[
                          'ts-menubar__chevron',
                          isOpen ? 'ts-menubar__chevron--rotated' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        size={14}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {hasChildren && isOpen && (
                    <div className="ts-menubar__dropdown" role="menu">
                      {item.children?.map((subItem) => (
                        <React.Fragment key={subItem.id}>
                          <button
                            type="button"
                            role="menuitem"
                            className={[
                              'ts-menubar__dropdown-item',
                              subItem.disabled ? 'ts-menubar__dropdown-item--disabled' : '',
                              subItem.danger ? 'ts-menubar__dropdown-item--danger' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            disabled={subItem.disabled}
                            onClick={() => handleDropdownSubItemClick(subItem)}
                          >
                            <div className="ts-menubar__dropdown-left">
                              {subItem.icon && (
                                <span className="ts-menubar__dropdown-icon">{subItem.icon}</span>
                              )}
                              <span>{subItem.label}</span>
                            </div>
                            {subItem.shortcut && (
                              <kbd className="ts-menubar__shortcut">{subItem.shortcut}</kbd>
                            )}
                          </button>
                          {subItem.dividerAfter && (
                            <div className="ts-menubar__dropdown-divider" role="separator" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {children}
          </nav>

          {/* Search Slot */}
          {searchSlot && <div className="ts-menubar__search">{searchSlot}</div>}

          {/* Actions / Trailing Slot */}
          {actionsSlot && <div className="ts-menubar__actions">{actionsSlot}</div>}
        </div>
      </header>
    );
  }
);
MenuBar.displayName = 'MenuBar';

/* ==========================================================================
   CollapsibleMenuBar Component
   ========================================================================== */
export interface CollapsibleMenuBarProps extends Omit<MenuBarProps, 'children'> {
  /** Controlled collapse state */
  collapsed?: boolean;
  /** Initial collapse state for uncontrolled usage */
  defaultCollapsed?: boolean;
  /** Callback fired when collapsed state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Label for screen-readers on the toggle button */
  toggleAriaLabel?: string;
  children?: React.ReactNode;
}

/**
 * ThoughtStream CollapsibleMenuBar Component
 *
 * Minimalist responsive navigation bar that can seamlessly collapse into
 * a compact bar and unfold into an unadorned tray.
 */
export const CollapsibleMenuBar = forwardRef<HTMLElement, CollapsibleMenuBarProps>(
  (
    {
      brand,
      items = [],
      searchSlot,
      actionsSlot,
      size = 'md',
      bordered = true,
      sticky = false,
      collapsed: controlledCollapsed,
      defaultCollapsed = true,
      onCollapseChange,
      toggleAriaLabel = 'Toggle navigation menu',
      onItemClick,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
    const isCollapsed =
      controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

    const toggleCollapse = () => {
      const next = !isCollapsed;
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(next);
      }
      onCollapseChange?.(next);
    };

    const handleItemClick = (item: MenuBarItemConfig | MenuDropdownItem) => {
      onItemClick?.(item);
    };

    const classes = [
      'ts-menubar',
      'ts-menubar--collapsible',
      `ts-menubar--${size}`,
      isCollapsed ? 'ts-menubar--is-collapsed' : 'ts-menubar--is-expanded',
      bordered ? 'ts-menubar--bordered' : '',
      sticky ? 'ts-menubar--sticky' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <header ref={ref} className={classes} role="banner" {...props}>
        {/* Main Bar Top Line */}
        <div className="ts-menubar__inner">
          {/* Brand Wordmark / Emblem */}
          {brand && <div className="ts-menubar__brand">{brand}</div>}

          {/* Quick Actions in bar (visible even when collapsed) */}
          <div className="ts-menubar__collapsible-top-actions">
            {actionsSlot && <div className="ts-menubar__actions-compact">{actionsSlot}</div>}

            {/* Sharp 0px Hamburger/X Toggle Button */}
            <button
              type="button"
              className="ts-menubar__toggle-btn"
              onClick={toggleCollapse}
              aria-expanded={!isCollapsed}
              aria-label={toggleAriaLabel}
            >
              {isCollapsed ? <MenuIcon size={18} /> : <X size={18} />}
            </button>
          </div>
        </div>

        {/* Collapsible Unfolded Tray */}
        {!isCollapsed && (
          <div className="ts-menubar__tray" role="region" aria-label="Expanded Menu">
            {searchSlot && <div className="ts-menubar__tray-search">{searchSlot}</div>}

            <nav className="ts-menubar__tray-nav" role="navigation">
              {items.map((item) => (
                <div key={item.id} className="ts-menubar__tray-item-group">
                  <button
                    type="button"
                    className={[
                      'ts-menubar__tray-item',
                      item.active ? 'ts-menubar__tray-item--active' : '',
                      item.disabled ? 'ts-menubar__tray-item--disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={item.disabled}
                    onClick={() => {
                      if (!item.disabled) {
                        item.onClick?.();
                        handleItemClick(item);
                      }
                    }}
                  >
                    <div className="ts-menubar__tray-item-content">
                      {item.icon && (
                        <span className="ts-menubar__item-icon">{item.icon}</span>
                      )}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="ts-menubar__item-badge">{item.badge}</span>
                    )}
                  </button>

                  {/* Nested sub items in tray */}
                  {item.children && item.children.length > 0 && (
                    <div className="ts-menubar__tray-sublist">
                      {item.children.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          className={[
                            'ts-menubar__tray-subitem',
                            sub.disabled ? 'ts-menubar__tray-subitem--disabled' : '',
                            sub.danger ? 'ts-menubar__tray-subitem--danger' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          disabled={sub.disabled}
                          onClick={() => {
                            if (!sub.disabled) {
                              sub.onClick?.();
                              handleItemClick(sub);
                            }
                          }}
                        >
                          <div className="ts-menubar__dropdown-left">
                            {sub.icon && (
                              <span className="ts-menubar__dropdown-icon">{sub.icon}</span>
                            )}
                            <span>{sub.label}</span>
                          </div>
                          {sub.shortcut && (
                            <kbd className="ts-menubar__shortcut">{sub.shortcut}</kbd>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {children}
            </nav>
          </div>
        )}
      </header>
    );
  }
);
CollapsibleMenuBar.displayName = 'CollapsibleMenuBar';
