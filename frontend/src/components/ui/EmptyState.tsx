import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import './StateComponents.css';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="fic-state-container">
      <div className="fic-state-icon fic-state-icon--empty">
        {icon || <PackageOpen size={40} />}
      </div>
      <h4 className="fic-state-title">{title}</h4>
      <p className="fic-state-subtext">{description}</p>
      {actionLabel && onAction && (
        <div style={{ marginTop: '16px' }}>
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
