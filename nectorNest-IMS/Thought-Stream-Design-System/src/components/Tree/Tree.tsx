import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import './Tree.css';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Search,
  X,
  GripVertical,
} from 'lucide-react';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  badge?: React.ReactNode;
  category?: string;
  data?: Record<string, unknown>;
}

export type TreeFilterMode = 'filter' | 'highlight';
export type TreeDropPosition = 'before' | 'after' | 'inside';

export interface TreeFilterCategory {
  id: string;
  label: string;
}

export interface TreeProps {
  /** Hierarchical tree data nodes */
  data: TreeNode[];
  /** Currently selected node ID (controlled) */
  selectedId?: string | null;
  /** Initial selected node ID (uncontrolled) */
  defaultSelectedId?: string | null;
  /** Callback fired when a node is selected */
  onSelect?: (node: TreeNode) => void;

  /** Expanded node IDs (controlled) */
  expandedIds?: string[];
  /** Initial expanded node IDs (uncontrolled) */
  defaultExpandedIds?: string[];
  /** Expand all branch nodes by default */
  defaultExpandAll?: boolean;
  /** Callback fired when node expanded state toggles */
  onToggleExpand?: (nodeId: string, isExpanded: boolean) => void;

  /** Enable checkboxes next to tree nodes */
  checkable?: boolean;
  /** Currently checked node IDs */
  checkedIds?: string[];
  /** Callback fired when checked node IDs change */
  onCheck?: (checkedIds: string[], node: TreeNode, checked: boolean) => void;

  /* ------------------- FILTERING PROPS ------------------- */
  /** Enable search / filter input at top */
  searchable?: boolean;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Filter query (controlled) */
  filterQuery?: string;
  /** Callback on filter text change */
  onFilterChange?: (query: string) => void;
  /** Filtering mode: 'filter' (hide non-matching) or 'highlight' (keep all, highlight matches) */
  filterMode?: TreeFilterMode;
  /** Custom filter predicate */
  filterPredicate?: (node: TreeNode, query: string, activeCategory?: string) => boolean;
  /** Category tags for filtering */
  filterCategories?: TreeFilterCategory[];
  /** Active category ID */
  activeCategory?: string;
  /** Callback when category filter changes */
  onCategoryChange?: (categoryId: string) => void;
  /** Show matches count badge in search header */
  showMatchCount?: boolean;

  /* ------------------- SORTABLE PROPS ------------------- */
  /** Enable drag and drop reordering of tree nodes */
  sortable?: boolean;
  /** Require dragging via dedicated grip handle */
  dragHandle?: boolean;
  /** Callback fired when a node is dragged and dropped to a new position */
  onMoveNode?: (
    draggedId: string,
    targetId: string,
    position: TreeDropPosition,
    newTree: TreeNode[]
  ) => void;
  /** Validate if drop should be permitted */
  canDrop?: (
    draggedNode: TreeNode,
    targetNode: TreeNode,
    position: TreeDropPosition
  ) => boolean;

  /** Remove outer border box */
  borderless?: boolean;
  /** Indentation per level in pixels */
  indentWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

/* -------------------------------------------------------------------------- */
/*                           TREE REORDER UTILITIES                           */
/* -------------------------------------------------------------------------- */

export const findTreeNode = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findTreeNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const isDescendant = (nodes: TreeNode[], parentId: string, targetId: string): boolean => {
  const parent = findTreeNode(nodes, parentId);
  if (!parent || !parent.children) return false;

  const check = (items: TreeNode[]): boolean => {
    for (const item of items) {
      if (item.id === targetId) return true;
      if (item.children && check(item.children)) return true;
    }
    return false;
  };
  return check(parent.children);
};

export const removeTreeNode = (
  nodes: TreeNode[],
  idToRemove: string
): { newNodes: TreeNode[]; removedNode: TreeNode | null } => {
  let removed: TreeNode | null = null;

  const traverse = (items: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];
    for (const item of items) {
      if (item.id === idToRemove) {
        removed = item;
        continue;
      }
      if (item.children) {
        result.push({
          ...item,
          children: traverse(item.children),
        });
      } else {
        result.push(item);
      }
    }
    return result;
  };

  const newNodes = traverse(nodes);
  return { newNodes, removedNode: removed };
};

/**
 * Immutably move a node in a tree to a new position (before, after, or inside target).
 */
export const moveTreeNode = (
  nodes: TreeNode[],
  draggedId: string,
  targetId: string,
  position: TreeDropPosition
): TreeNode[] => {
  if (draggedId === targetId) return nodes;
  if (isDescendant(nodes, draggedId, targetId)) return nodes; // Prevent moving folder into itself

  const { newNodes, removedNode } = removeTreeNode(nodes, draggedId);
  if (!removedNode) return nodes;

  const insert = (items: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.id === targetId) {
        if (position === 'before') {
          result.push(removedNode);
          result.push(item);
        } else if (position === 'after') {
          result.push(item);
          result.push(removedNode);
        } else if (position === 'inside') {
          result.push({
            ...item,
            children: [...(item.children || []), removedNode],
          });
        }
      } else if (item.children) {
        result.push({
          ...item,
          children: insert(item.children),
        });
      } else {
        result.push(item);
      }
    }

    return result;
  };

  return insert(newNodes);
};

const collectAllBranchIds = (nodes: TreeNode[]): string[] => {
  const ids: string[] = [];
  const traverse = (items: TreeNode[]) => {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        ids.push(item.id);
        traverse(item.children);
      }
    }
  };
  traverse(nodes);
  return ids;
};

/**
 * ThoughtStream Tree Component
 *
 * Implements a hierarchical tree view with collapsible branches,
 * search filtering with text highlights, filter categories,
 * drag-and-drop sortable node reordering, checkboxes, and 0px hairline geometry.
 */
export const Tree: React.FC<TreeProps> = ({
  data,
  selectedId: controlledSelectedId,
  defaultSelectedId = null,
  onSelect,
  expandedIds: controlledExpandedIds,
  defaultExpandedIds,
  defaultExpandAll = false,
  onToggleExpand,
  checkable = false,
  checkedIds: controlledCheckedIds,
  onCheck,
  searchable = false,
  searchPlaceholder = 'Filter tree nodes...',
  filterQuery: controlledFilterQuery,
  onFilterChange,
  filterMode = 'filter',
  filterPredicate,
  filterCategories,
  activeCategory: controlledActiveCategory,
  onCategoryChange,
  showMatchCount = true,
  sortable = false,
  dragHandle = false,
  onMoveNode,
  canDrop,
  borderless = false,
  indentWidth = 20,
  className = '',
  style,
}) => {
  // Selection
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(defaultSelectedId);
  const activeSelectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  // Expansion
  const [internalExpandedIds, setInternalExpandedIds] = useState<string[]>(() => {
    if (defaultExpandedIds) return defaultExpandedIds;
    if (defaultExpandAll) return collectAllBranchIds(data);
    return [];
  });
  const activeExpandedIds = controlledExpandedIds !== undefined ? controlledExpandedIds : internalExpandedIds;

  // Checkboxes
  const [internalCheckedIds, setInternalCheckedIds] = useState<string[]>([]);
  const activeCheckedIds = controlledCheckedIds !== undefined ? controlledCheckedIds : internalCheckedIds;

  // Filtering
  const [internalFilterQuery, setInternalFilterQuery] = useState('');
  const activeQuery = controlledFilterQuery !== undefined ? controlledFilterQuery : internalFilterQuery;

  const [internalCategory, setInternalCategory] = useState<string>(
    filterCategories?.[0]?.id || 'all'
  );
  const currentCategory = controlledActiveCategory !== undefined ? controlledActiveCategory : internalCategory;

  // Drag & drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    targetId: string;
    position: TreeDropPosition;
  } | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = useCallback(
    (nodeId: string) => {
      const isExpanded = activeExpandedIds.includes(nodeId);
      const updated = isExpanded
        ? activeExpandedIds.filter((id) => id !== nodeId)
        : [...activeExpandedIds, nodeId];

      if (controlledExpandedIds === undefined) {
        setInternalExpandedIds(updated);
      }
      onToggleExpand?.(nodeId, !isExpanded);
    },
    [activeExpandedIds, controlledExpandedIds, onToggleExpand]
  );

  const handleSelectNode = (node: TreeNode) => {
    if (node.disabled) return;
    if (controlledSelectedId === undefined) {
      setInternalSelectedId(node.id);
    }
    onSelect?.(node);
  };

  const handleCheckChange = (node: TreeNode, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const isChecked = e.target.checked;
    const updated = isChecked
      ? [...activeCheckedIds, node.id]
      : activeCheckedIds.filter((id) => id !== node.id);

    if (controlledCheckedIds === undefined) {
      setInternalCheckedIds(updated);
    }
    onCheck?.(updated, node, isChecked);
  };

  const handleSearchInputChange = (val: string) => {
    if (controlledFilterQuery === undefined) {
      setInternalFilterQuery(val);
    }
    onFilterChange?.(val);
  };

  const handleCategoryClick = (catId: string) => {
    if (controlledActiveCategory === undefined) {
      setInternalCategory(catId);
    }
    onCategoryChange?.(catId);
  };

  // Default match evaluation
  const defaultPredicate = useCallback(
    (node: TreeNode, query: string, category?: string) => {
      const matchesCategory =
        !category || category === 'all' || node.category === category;

      if (!matchesCategory) return false;
      if (!query.trim()) return true;

      const q = query.toLowerCase();
      const inLabel = node.label.toLowerCase().includes(q);
      const inBadge = typeof node.badge === 'string' && node.badge.toLowerCase().includes(q);
      return inLabel || inBadge;
    },
    []
  );

  const evaluatePredicate = filterPredicate || defaultPredicate;

  // Filter tree and calculate auto-expansion & match count
  const { filteredData, autoExpandedIds, totalMatches } = useMemo(() => {
    const query = activeQuery.trim();
    const hasCategoryFilter = currentCategory && currentCategory !== 'all';

    if (!query && !hasCategoryFilter) {
      return { filteredData: data, autoExpandedIds: [], totalMatches: 0 };
    }

    const autoExpand: string[] = [];
    let matchCount = 0;

    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      const result: TreeNode[] = [];

      for (const node of nodes) {
        const isMatch = evaluatePredicate(node, query, currentCategory);
        if (isMatch) matchCount++;

        const filteredChildren = node.children ? filterNodes(node.children) : [];

        if (filterMode === 'filter') {
          // Prune non-matches
          if (isMatch || filteredChildren.length > 0) {
            if (filteredChildren.length > 0) {
              autoExpand.push(node.id);
            }
            result.push({
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children,
            });
          }
        } else {
          // Highlight mode: keep node, but auto-expand to matches
          if (filteredChildren.length > 0 || isMatch) {
            if (filteredChildren.length > 0) autoExpand.push(node.id);
          }
          result.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children,
          });
        }
      }

      return result;
    };

    return {
      filteredData: filterNodes(data),
      autoExpandedIds: autoExpand,
      totalMatches: matchCount,
    };
  }, [data, activeQuery, currentCategory, evaluatePredicate, filterMode]);

  const effectiveExpandedIds =
    activeQuery.trim() || (currentCategory && currentCategory !== 'all')
      ? Array.from(new Set([...activeExpandedIds, ...autoExpandedIds]))
      : activeExpandedIds;

  // Label highlighting helper
  const renderLabel = (label: string) => {
    if (!activeQuery.trim()) return label;

    const query = activeQuery.toLowerCase();
    const index = label.toLowerCase().indexOf(query);
    if (index === -1) return label;

    const before = label.substring(0, index);
    const match = label.substring(index, index + query.length);
    const after = label.substring(index + query.length);

    return (
      <>
        {before}
        <mark className="ts-tree-match-highlight">{match}</mark>
        {after}
      </>
    );
  };

  /* ------------------- DRAG AND DROP HANDLERS ------------------- */

  const handleDragStartNode = (node: TreeNode, e: React.DragEvent) => {
    if (!sortable || node.disabled) return;
    setDraggedId(node.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id);
  };

  const handleDragOverNode = (node: TreeNode, e: React.DragEvent<HTMLDivElement>) => {
    if (!sortable || !draggedId || draggedId === node.id) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const height = rect.height;

    let position: TreeDropPosition;
    const hasChildren = Boolean(node.children);

    if (relY < height * 0.28) {
      position = 'before';
    } else if (relY > height * 0.72) {
      position = 'after';
    } else if (hasChildren) {
      position = 'inside';
    } else {
      position = relY < height / 2 ? 'before' : 'after';
    }

    const draggedNode = findTreeNode(data, draggedId);
    if (!draggedNode) return;

    if (canDrop && !canDrop(draggedNode, node, position)) {
      return;
    }

    setDropTarget({ targetId: node.id, position });

    // Auto-expand closed folder if hovering over it for 600ms
    if (position === 'inside' && hasChildren && !effectiveExpandedIds.includes(node.id)) {
      if (!hoverTimerRef.current) {
        hoverTimerRef.current = setTimeout(() => {
          handleToggle(node.id);
        }, 600);
      }
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    }
  };

  const handleDragLeaveNode = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTarget(null);
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    }
  };

  const handleDropNode = (node: TreeNode, e: React.DragEvent) => {
    if (!sortable || !draggedId || !dropTarget) return;
    e.preventDefault();
    e.stopPropagation();

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    const { position } = dropTarget;
    const newTree = moveTreeNode(data, draggedId, node.id, position);

    onMoveNode?.(draggedId, node.id, position, newTree);

    // Auto expand parent if dropped inside
    if (position === 'inside' && !activeExpandedIds.includes(node.id)) {
      handleToggle(node.id);
    }

    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  /* ------------------- RECURSIVE NODE RENDERER ------------------- */

  const renderTreeNodes = (nodes: TreeNode[], level: number = 0) => {
    return (
      <ul className="ts-tree-list" role={level === 0 ? 'tree' : 'group'}>
        {nodes.map((node) => {
          const hasChildren = Boolean(node.children && node.children.length > 0);
          const isExpanded = effectiveExpandedIds.includes(node.id);
          const isSelected = activeSelectedId === node.id;
          const isChecked = activeCheckedIds.includes(node.id);

          const isBeingDragged = draggedId === node.id;
          const isDropBefore = dropTarget?.targetId === node.id && dropTarget.position === 'before';
          const isDropAfter = dropTarget?.targetId === node.id && dropTarget.position === 'after';
          const isDropInside = dropTarget?.targetId === node.id && dropTarget.position === 'inside';

          let defaultIcon = <FileText size={16} />;
          if (hasChildren) {
            defaultIcon = isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
          }
          const icon = node.icon !== undefined ? node.icon : defaultIcon;

          return (
            <li
              key={node.id}
              role="treeitem"
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-selected={isSelected}
            >
              <div
                draggable={sortable && !dragHandle && !node.disabled}
                onDragStart={(e) => handleDragStartNode(node, e)}
                onDragOver={(e) => handleDragOverNode(node, e)}
                onDragLeave={handleDragLeaveNode}
                onDrop={(e) => handleDropNode(node, e)}
                onDragEnd={handleDragEnd}
                className={[
                  'ts-tree-node-row',
                  isSelected ? 'ts-tree-node-row--selected' : '',
                  node.disabled ? 'ts-tree-node-row--disabled' : '',
                  sortable ? 'ts-tree-node-row--draggable' : '',
                  isBeingDragged ? 'ts-tree-node-row--dragging' : '',
                  isDropBefore ? 'ts-tree-node-row--drop-before' : '',
                  isDropAfter ? 'ts-tree-node-row--drop-after' : '',
                  isDropInside ? 'ts-tree-node-row--drop-inside' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ paddingLeft: `${level * indentWidth + 8}px` }}
                onClick={() => handleSelectNode(node)}
                tabIndex={node.disabled ? -1 : 0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (hasChildren) handleToggle(node.id);
                    handleSelectNode(node);
                  } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
                    handleToggle(node.id);
                  } else if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
                    handleToggle(node.id);
                  }
                }}
              >
                <div className="ts-tree-node-left">
                  {sortable && dragHandle && (
                    <span
                      draggable={!node.disabled}
                      onDragStart={(e) => handleDragStartNode(node, e)}
                      className="ts-tree-drag-handle"
                    >
                      <GripVertical size={14} />
                    </span>
                  )}

                  {hasChildren ? (
                    <button
                      type="button"
                      className="ts-tree-toggle-btn"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(node.id);
                      }}
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  ) : (
                    <span className="ts-tree-toggle-placeholder" />
                  )}

                  {checkable && (
                    <input
                      type="checkbox"
                      className="ts-tree-checkbox"
                      checked={isChecked}
                      disabled={node.disabled}
                      onChange={(e) => handleCheckChange(node, e)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  {icon && <span className="ts-tree-node-icon">{icon}</span>}

                  <span className="ts-tree-node-label">{renderLabel(node.label)}</span>
                </div>

                {node.badge && (
                  <div className="ts-tree-node-right">
                    <span className="ts-tree-badge">{node.badge}</span>
                  </div>
                )}
              </div>

              {hasChildren && isExpanded && node.children && (
                renderTreeNodes(node.children, level + 1)
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const isFiltered = activeQuery.trim().length > 0 || (currentCategory && currentCategory !== 'all');

  return (
    <div
      className={`ts-tree ${borderless ? 'ts-tree--borderless' : ''} ${className}`.trim()}
      style={style}
    >
      {searchable && (
        <div className="ts-tree-search-bar">
          <div className="ts-tree-search-input-wrapper">
            <span className="ts-tree-search-icon">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="ts-tree-search-input"
              value={activeQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder={searchPlaceholder}
            />
            {activeQuery && (
              <button
                type="button"
                className="ts-tree-search-clear-btn"
                onClick={() => handleSearchInputChange('')}
                aria-label="Clear filter"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {filterCategories && filterCategories.length > 0 && (
            <div className="ts-tree-filter-categories">
              {filterCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={[
                    'ts-tree-filter-category-btn',
                    currentCategory === cat.id ? 'ts-tree-filter-category-btn--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {showMatchCount && isFiltered && (
            <div className="ts-tree-match-bar">
              <span>{totalMatches} {totalMatches === 1 ? 'match' : 'matches'} found</span>
              {activeQuery && (
                <span style={{ textTransform: 'capitalize' }}>Mode: {filterMode}</span>
              )}
            </div>
          )}
        </div>
      )}

      {renderTreeNodes(filteredData, 0)}
    </div>
  );
};

Tree.displayName = 'Tree';

/* -------------------------------------------------------------------------- */
/*                     SORTABLE TREE STATEFUL WRAPPER                         */
/* -------------------------------------------------------------------------- */

export interface SortableTreeProps extends Omit<TreeProps, 'sortable'> {
  /** Callback fired when tree data changes after a reorder */
  onTreeChange?: (newTree: TreeNode[]) => void;
}

/**
 * Stateful SortableTree component that manages tree state internally
 * while providing drag & drop node reordering.
 */
export const SortableTree: React.FC<SortableTreeProps> = ({
  data,
  onTreeChange,
  onMoveNode,
  ...props
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>(data);

  useEffect(() => {
    setTreeData(data);
  }, [data]);

  const handleMove = (
    draggedId: string,
    targetId: string,
    position: TreeDropPosition,
    newTree: TreeNode[]
  ) => {
    setTreeData(newTree);
    onTreeChange?.(newTree);
    onMoveNode?.(draggedId, targetId, position, newTree);
  };

  return (
    <Tree
      {...props}
      data={treeData}
      sortable
      onMoveNode={handleMove}
    />
  );
};

SortableTree.displayName = 'SortableTree';
