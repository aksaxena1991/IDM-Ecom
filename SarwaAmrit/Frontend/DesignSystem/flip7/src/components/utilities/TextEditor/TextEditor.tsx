import React, { useRef } from 'react';
import '../utilities.css';

export interface TextEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  defaultValue = '',
  onChange,
  placeholder = 'House rules…',
  className = '',
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (before: string, after = before) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = `${el.value.slice(0, start)}${before}${el.value.slice(start, end)}${after}${el.value.slice(end)}`;
    onChange?.(next);
    if (value === undefined) el.value = next;
  };

  return (
    <div className={['f7-editor', className].filter(Boolean).join(' ')}>
      <div className="f7-editor-toolbar">
        <button type="button" onClick={() => wrap('**')}>B</button>
        <button type="button" onClick={() => wrap('_')}>I</button>
        <button type="button" onClick={() => wrap('- ', '')}>List</button>
      </div>
      <textarea
        ref={ref}
        className="f7-editor-area"
        placeholder={placeholder}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};
TextEditor.displayName = 'TextEditor';
