import React, { useState } from 'react';
import { BigFriendlyButton } from '../../actions/BigFriendlyButton/BigFriendlyButton.js';
import './ReadingPassage.css';

export interface ReadingPassageProps {
  title?: string;
  passage: string;
  onReadAloud?: () => void;
}

export const ReadingPassage: React.FC<ReadingPassageProps> = ({
  title,
  passage,
  onReadAloud,
}) => {
  const [rulerOn, setRulerOn] = useState(false);
  const lines = passage.split('\n').filter(Boolean);

  return (
    <article className="sl-reading">
      {title ? <h2 className="sl-reading__title">{title}</h2> : null}
      <div className="sl-reading__toolbar">
        <BigFriendlyButton type="button" onClick={onReadAloud}>
          Read to me
        </BigFriendlyButton>
        <button
          type="button"
          className="sl-reading__toggle"
          aria-pressed={rulerOn}
          onClick={() => setRulerOn((v) => !v)}
        >
          Reading ruler {rulerOn ? 'on' : 'off'}
        </button>
      </div>
      <div className={['sl-reading__body', rulerOn ? 'sl-reading__body--ruler' : ''].join(' ')}>
        {lines.map((line, index) => (
          <p key={index} className="sl-reading__line">
            {line}
          </p>
        ))}
      </div>
    </article>
  );
};
