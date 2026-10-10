import React, {
  createContext,
  useContext,
  useState,
  useId,
  forwardRef,
  useRef,
  useEffect,
} from 'react';
import './Tabs.css';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsVariant = 'line' | 'enclosed' | 'subtle' | 'pills';
export type TabsSize = 'sm' | 'md' | 'lg';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  content?: React.ReactNode;
}

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
  orientation: TabsOrientation;
  variant: TabsVariant;
  size: TabsSize;
  baseId: string;
  registerTab: (id: string, element: HTMLButtonElement | null) => void;
  tabElements: React.MutableRefObject<Map<string, HTMLButtonElement>>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs provider');
  }
  return context;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled active tab id/value */
  value?: string;
  /** Initial active tab id/value for uncontrolled usage */
  defaultValue?: string;
  /** Callback fired when selected tab changes */
  onValueChange?: (value: string) => void;
  /** Tab layout orientation: horizontal row or vertical column */
  orientation?: TabsOrientation;
  /** Visual indicator & container style */
  variant?: TabsVariant;
  /** Scale sizing */
  size?: TabsSize;
  /** Optional array of tab items for concise data-driven rendering */
  items?: TabItem[];
  /** When true, takes up 100% width and stretches tab buttons equally (horizontal only) */
  fullWidth?: boolean;
  children?: React.ReactNode;
}

/**
 * ThoughtStream Tabs Component
 *
 * Distraction-free, contemplative tab navigation supporting
 * horizontal and vertical orientations with 0px geometry and
 * accessible keyboard interactions.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      orientation = 'horizontal',
      variant = 'line',
      size = 'md',
      items,
      fullWidth = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseId = useId();
    const [internalValue, setInternalValue] = useState<string>(() => {
      if (controlledValue !== undefined) return controlledValue;
      if (defaultValue !== undefined) return defaultValue;
      if (items && items.length > 0) return items[0].id;
      return '';
    });

    const activeValue = controlledValue !== undefined ? controlledValue : internalValue;
    const tabElements = useRef<Map<string, HTMLButtonElement>>(new Map());

    const registerTab = (id: string, el: HTMLButtonElement | null) => {
      if (el) {
        tabElements.current.set(id, el);
      } else {
        tabElements.current.delete(id);
      }
    };

    const handleValueChange = (nextValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    };

    const classes = [
      'ts-tabs',
      `ts-tabs--${orientation}`,
      `ts-tabs--${variant}`,
      `ts-tabs--${size}`,
      fullWidth ? 'ts-tabs--full-width' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const contextValue: TabsContextValue = {
      value: activeValue,
      onValueChange: handleValueChange,
      orientation,
      variant,
      size,
      baseId,
      registerTab,
      tabElements,
    };

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className={classes} {...props}>
          {items ? (
            <>
              <TabList>
                {items.map((item) => (
                  <Tab
                    key={item.id}
                    value={item.id}
                    icon={item.icon}
                    badge={item.badge}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </Tab>
                ))}
              </TabList>
              <div className="ts-tabs__content-area">
                {items.map((item) => (
                  <TabPanel key={item.id} value={item.id}>
                    {item.content}
                  </TabPanel>
                ))}
              </div>
            </>
          ) : (
            children
          )}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

/* ==========================================================================
   TabList Component
   ========================================================================== */
export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  'aria-label'?: string;
  children: React.ReactNode;
}

export const TabList = forwardRef<HTMLDivElement, TabListProps>(
  ({ children, className = '', 'aria-label': ariaLabel = 'Navigation tabs', ...props }, ref) => {
    const { orientation, tabElements } = useTabsContext();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const tabs = Array.from(tabElements.current.values()).filter(
        (tab) => !tab.disabled && tab.offsetParent !== null
      );
      if (tabs.length === 0) return;

      const activeElement = document.activeElement as HTMLButtonElement;
      const currentIndex = tabs.indexOf(activeElement);
      if (currentIndex === -1) return;

      let nextIndex = -1;

      if (orientation === 'horizontal') {
        if (e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }
      } else {
        if (e.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % tabs.length;
        } else if (e.key === 'ArrowUp') {
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }
      }

      if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== -1) {
        e.preventDefault();
        const nextTab = tabs[nextIndex];
        nextTab.focus();
        nextTab.click();
      }
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={`ts-tab-list ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabList.displayName = 'TabList';

/* ==========================================================================
   Tab Component
   ========================================================================== */
export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Unique value identifying this tab */
  value: string;
  /** Optional icon to render before label */
  icon?: React.ReactNode;
  /** Optional badge or counter */
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ value, icon, badge, children, disabled = false, className = '', ...props }, forwardedRef) => {
    const { value: activeValue, onValueChange, baseId, registerTab } = useTabsContext();
    const isSelected = activeValue === value;
    const tabId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;
    const localRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
      registerTab(value, localRef.current);
      return () => registerTab(value, null);
    }, [value, registerTab]);

    const setRefs = (node: HTMLButtonElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const classes = [
      'ts-tab',
      isSelected ? 'ts-tab--active' : '',
      disabled ? 'ts-tab--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={setRefs}
        role="tab"
        id={tabId}
        type="button"
        aria-selected={isSelected}
        aria-controls={panelId}
        tabIndex={isSelected ? 0 : -1}
        disabled={disabled}
        onClick={() => !disabled && onValueChange(value)}
        className={classes}
        {...props}
      >
        {icon && <span className="ts-tab__icon" aria-hidden="true">{icon}</span>}
        <span className="ts-tab__label">{children}</span>
        {badge !== undefined && <span className="ts-tab__badge">{badge}</span>}
      </button>
    );
  }
);
Tab.displayName = 'Tab';

/* ==========================================================================
   TabPanel Component
   ========================================================================== */
export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Value matching the corresponding Tab */
  value: string;
  children?: React.ReactNode;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, children, className = '', ...props }, ref) => {
    const { value: activeValue, baseId } = useTabsContext();
    const isSelected = activeValue === value;
    const tabId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    if (!isSelected) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId}
        tabIndex={0}
        className={`ts-tab-panel ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabPanel.displayName = 'TabPanel';
