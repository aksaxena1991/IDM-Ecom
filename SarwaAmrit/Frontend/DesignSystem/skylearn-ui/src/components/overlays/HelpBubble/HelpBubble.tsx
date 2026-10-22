import React from 'react';
import './HelpBubble.css';

export interface HelpBubbleProps {
  message: string;
  mascotName?: string;
}

export const HelpBubble: React.FC<HelpBubbleProps> = ({
  message,
  mascotName = 'Sky',
}) => {
  return (
    <div className="sl-help-bubble" role="note">
      <span className="sl-help-bubble__mascot" aria-hidden>
        🦉
      </span>
      <div className="sl-help-bubble__content">
        <p className="sl-help-bubble__from">{mascotName} says</p>
        <p className="sl-help-bubble__message">{message}</p>
      </div>
    </div>
  );
};
