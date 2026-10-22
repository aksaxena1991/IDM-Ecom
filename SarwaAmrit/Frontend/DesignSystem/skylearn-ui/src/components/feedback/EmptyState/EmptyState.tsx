import React from 'react';
import { Icon, type SkyLearnIconName } from '../../display/Icon/Icon.js';
import './EmptyState.css';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: SkyLearnIconName;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  description = 'Pick a lesson to start!',
  icon = 'book',
  action,
}) => {
  return (
    <div className="sl-empty-state" role="status">
      <Icon name={icon} size="lg" tone="active" />
      <h3 className="sl-empty-state__title">{title}</h3>
      <p className="sl-empty-state__desc">{description}</p>
      {action ? <div className="sl-empty-state__action">{action}</div> : null}
    </div>
  );
};
