import React from 'react';
import './AnswerTile.css';

export type AnswerTileState = 'default' | 'correct' | 'incorrect';

export interface AnswerTileProps {
  label: string;
  state?: AnswerTileState;
  showWhyHref?: string;
  onSelect?: () => void;
  selected?: boolean;
}

export const AnswerTile: React.FC<AnswerTileProps> = ({
  label,
  state = 'default',
  showWhyHref,
  onSelect,
  selected = false,
}) => {
  return (
    <div className={['sl-answer-tile-wrap', state !== 'default' ? `sl-answer-tile-wrap--${state}` : ''].join(' ')}>
      <button
        type="button"
        className={[
          'sl-answer-tile',
          `sl-answer-tile--${state}`,
          selected ? 'sl-answer-tile--selected' : '',
          state === 'incorrect' ? 'sl-animate-shake' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={onSelect}
        aria-pressed={selected}
      >
        <span className="sl-answer-tile__label">{label}</span>
        {state === 'correct' ? (
          <>
            <span className="sl-answer-tile__sparkles" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="sl-answer-tile__badge sl-answer-tile__badge--ok" aria-label="Correct">
              ✓
            </span>
          </>
        ) : null}
        {state === 'incorrect' ? (
          <span className="sl-answer-tile__badge sl-answer-tile__badge--retry" aria-label="Try again">
            ×
          </span>
        ) : null}
      </button>
      {state === 'incorrect' ? (
        <p className="sl-answer-tile__retry">Not quite — let&apos;s try again.</p>
      ) : null}
      {showWhyHref && state === 'incorrect' ? (
        <a className="sl-answer-tile__why" href={showWhyHref}>
          Show me why
        </a>
      ) : null}
    </div>
  );
};
