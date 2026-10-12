import React, { useState } from 'react';
import '../utilities.css';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export interface TreeProps {
  data: TreeNode[];
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
  className?: string;
}

const Node: React.FC<{ node: TreeNode; depth: number; selectedId?: string; onSelect?: (n: TreeNode) => void }> = ({
  node,
  depth,
  selectedId,
  onSelect,
}) => {
  const [open, setOpen] = useState(true);
  const hasKids = Boolean(node.children?.length);
  return (
    <div>
      <div
        className={['f7-tree-node', selectedId === node.id ? 'is-on' : ''].filter(Boolean).join(' ')}
        style={{ paddingLeft: depth * 16 }}
        onClick={() => {
          if (hasKids) setOpen((v) => !v);
          onSelect?.(node);
        }}
      >
        <span>{hasKids ? (open ? '▾' : '▸') : '•'}</span>
        {node.label}
      </div>
      {open && node.children?.map((child) => (
        <Node key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
};

export const Tree: React.FC<TreeProps> = ({ data, selectedId, onSelect, className = '' }) => (
  <div className={['f7-tree', className].filter(Boolean).join(' ')}>
    {data.map((node) => (
      <Node key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={onSelect} />
    ))}
  </div>
);
Tree.displayName = 'Tree';
