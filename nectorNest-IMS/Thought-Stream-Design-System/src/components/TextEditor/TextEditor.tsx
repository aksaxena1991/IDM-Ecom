import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import './TextEditor.css';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Minus,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export type TextEditorViewMode = 'edit' | 'split' | 'preview';

export interface TextEditorProps {
  /** Controlled editor value (Markdown string) */
  value?: string;
  /** Initial editor value */
  defaultValue?: string;
  /** Callback fired when editor content updates */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Active view mode */
  viewMode?: TextEditorViewMode;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: TextEditorViewMode) => void;
  /** Hide the status bar at bottom */
  hideFooter?: boolean;
  /** Enable Zen (distraction-free fullscreen) mode by default */
  defaultZenMode?: boolean;
  /** Status indicator message (e.g. "Saved") */
  statusText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Minimum editor content height in pixels */
  minHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ThoughtStream TextEditor Component
 *
 * An editorial markdown writing environment with 0px geometry,
 * hairline borders, live reading metrics, and split preview.
 */
export const TextEditor: React.FC<TextEditorProps> = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  placeholder = 'Begin your contemplative monograph...',
  viewMode: controlledViewMode,
  onViewModeChange,
  hideFooter = false,
  defaultZenMode = false,
  statusText = 'Ready',
  disabled = false,
  minHeight = 320,
  className = '',
  style,
}) => {
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const activeValue = controlledValue !== undefined ? controlledValue : internalValue;

  const [internalViewMode, setInternalViewMode] = useState<TextEditorViewMode>('split');
  const activeViewMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;

  const [isZenMode, setIsZenMode] = useState<boolean>(defaultZenMode);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize internal value
  const handleContentChange = useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [controlledValue, onChange]
  );

  const handleModeChange = (mode: TextEditorViewMode) => {
    if (controlledViewMode === undefined) {
      setInternalViewMode(mode);
    }
    onViewModeChange?.(mode);
  };

  // Helper to wrap or prepend markdown markers around textarea selection
  const applyFormatting = (prefix: string, suffix: string = '', isLinePrefix: boolean = false) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;

    if (isLinePrefix) {
      // Find beginning of the current line
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
      handleContentChange(newText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    } else {
      const selected = text.substring(start, end);
      const replacement = prefix + (selected || 'text') + suffix;
      const newText = text.substring(0, start) + replacement + text.substring(end);
      handleContentChange(newText);
      setTimeout(() => {
        el.focus();
        if (selected) {
          el.setSelectionRange(start + prefix.length, end + prefix.length);
        } else {
          el.setSelectionRange(start + prefix.length, start + prefix.length + 4);
        }
      }, 0);
    }
  };

  // Keyboard shortcut handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormatting('**', '**');
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyFormatting('*', '*');
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      applyFormatting('[', '](https://example.com)');
    }
  };

  // Escape key exits Zen Mode
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isZenMode]);

  // Reading statistics calculation
  const stats = useMemo(() => {
    const trimmed = activeValue.trim();
    if (!trimmed) {
      return { words: 0, characters: 0, readingTimeMin: 0 };
    }
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const characters = trimmed.length;
    const readingTimeMin = Math.max(1, Math.ceil(words / 200));
    return { words, characters, readingTimeMin };
  }, [activeValue]);

  // Minimalist Markdown Preview Renderer
  const renderMarkdownPreview = (content: string) => {
    if (!content.trim()) {
      return (
        <div style={{ color: 'var(--ts-color-text-tertiary)', fontStyle: 'italic' }}>
          Markdown preview will appear here as you write...
        </div>
      );
    }

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${idx}`}>
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(<h1 key={idx}>{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={idx}>{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={idx}>{line.substring(4)}</h3>);
      } else if (line.startsWith('> ')) {
        elements.push(<blockquote key={idx}>{line.substring(2)}</blockquote>);
      } else if (line.startsWith('---') || line.startsWith('***')) {
        elements.push(<hr key={idx} />);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <ul key={idx}>
            <li>{line.substring(2)}</li>
          </ul>
        );
      } else if (/^\d+\.\s/.test(line)) {
        const textPart = line.replace(/^\d+\.\s/, '');
        elements.push(
          <ol key={idx}>
            <li>{textPart}</li>
          </ol>
        );
      } else if (line.trim().length === 0) {
        // empty space
      } else {
        elements.push(<p key={idx}>{line}</p>);
      }
    });

    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <pre key="code-end">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  return (
    <div
      className={[
        'ts-text-editor',
        isFocused ? 'ts-text-editor--focused' : '',
        isZenMode ? 'ts-text-editor--zen' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {/* Editorial Toolbar */}
      <div className="ts-text-editor-toolbar" role="toolbar" aria-label="Editorial formatting">
        <div className="ts-text-editor-toolbar-group">
          {/* Headings */}
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Heading 1"
            onClick={() => applyFormatting('# ', '', true)}
            disabled={disabled}
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Heading 2"
            onClick={() => applyFormatting('## ', '', true)}
            disabled={disabled}
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Heading 3"
            onClick={() => applyFormatting('### ', '', true)}
            disabled={disabled}
          >
            <Heading3 size={16} />
          </button>

          <span className="ts-text-editor-toolbar-separator" />

          {/* Inline formatting */}
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Bold (Cmd+B)"
            onClick={() => applyFormatting('**', '**')}
            disabled={disabled}
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Italic (Cmd+I)"
            onClick={() => applyFormatting('*', '*')}
            disabled={disabled}
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Strikethrough"
            onClick={() => applyFormatting('~~', '~~')}
            disabled={disabled}
          >
            <Strikethrough size={16} />
          </button>
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Inline Code"
            onClick={() => applyFormatting('`', '`')}
            disabled={disabled}
          >
            <Code size={16} />
          </button>

          <span className="ts-text-editor-toolbar-separator" />

          {/* Blocks */}
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Blockquote"
            onClick={() => applyFormatting('> ', '', true)}
            disabled={disabled}
          >
            <Quote size={16} />
          </button>
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Bullet List"
            onClick={() => applyFormatting('- ', '', true)}
            disabled={disabled}
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Numbered List"
            onClick={() => applyFormatting('1. ', '', true)}
            disabled={disabled}
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Divider Line"
            onClick={() => applyFormatting('\n---\n')}
            disabled={disabled}
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            className="ts-text-editor-btn"
            title="Insert Link"
            onClick={() => applyFormatting('[', '](https://example.com)')}
            disabled={disabled}
          >
            <LinkIcon size={16} />
          </button>
        </div>

        {/* View Mode & Zen Toggles */}
        <div className="ts-text-editor-toolbar-group">
          <div className="ts-text-editor-mode-tabs">
            <button
              type="button"
              className={[
                'ts-text-editor-tab-btn',
                activeViewMode === 'edit' ? 'ts-text-editor-tab-btn--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleModeChange('edit')}
            >
              Write
            </button>
            <button
              type="button"
              className={[
                'ts-text-editor-tab-btn',
                activeViewMode === 'split' ? 'ts-text-editor-tab-btn--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleModeChange('split')}
            >
              Split
            </button>
            <button
              type="button"
              className={[
                'ts-text-editor-tab-btn',
                activeViewMode === 'preview' ? 'ts-text-editor-tab-btn--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleModeChange('preview')}
            >
              Preview
            </button>
          </div>

          <span className="ts-text-editor-toolbar-separator" />

          <button
            type="button"
            className={[
              'ts-text-editor-btn',
              isZenMode ? 'ts-text-editor-btn--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            title={isZenMode ? 'Exit Zen Mode (Esc)' : 'Zen Fullscreen Mode'}
            onClick={() => setIsZenMode(!isZenMode)}
          >
            {isZenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Content Work Area */}
      <div className="ts-text-editor-content" style={{ minHeight }}>
        {(activeViewMode === 'edit' || activeViewMode === 'split') && (
          <textarea
            ref={textareaRef}
            className="ts-text-editor-textarea"
            value={activeValue}
            onChange={(e) => handleContentChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-label="Markdown text editor"
          />
        )}

        {activeViewMode === 'split' && (
          <div className="ts-text-editor-split-divider" />
        )}

        {(activeViewMode === 'preview' || activeViewMode === 'split') && (
          <div className="ts-text-editor-preview">
            {renderMarkdownPreview(activeValue)}
          </div>
        )}
      </div>

      {/* Metrics & Status Footer */}
      {!hideFooter && (
        <div className="ts-text-editor-footer">
          <div className="ts-text-editor-stats">
            <span>{stats.words.toLocaleString()} words</span>
            <span>{stats.characters.toLocaleString()} chars</span>
            <span>~{stats.readingTimeMin} min read</span>
          </div>

          <div className="ts-text-editor-save-state">
            <span className="ts-text-editor-save-dot" />
            <span>{statusText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

TextEditor.displayName = 'TextEditor';
