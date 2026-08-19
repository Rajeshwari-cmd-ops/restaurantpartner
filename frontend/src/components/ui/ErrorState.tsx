import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import './StateComponents.css';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message = 'Failed to load data from server. Please check your connection.',
  onRetry,
}) => {
  return (
    <div className="fic-state-container fic-state-container--error">
      <div className="fic-state-icon fic-state-icon--error">
        <AlertTriangle size={36} />
      </div>
      <h4 className="fic-state-title">{title}</h4>
      <p className="fic-state-subtext">{message}</p>
      {onRetry && (
        <div style={{ marginTop: '16px' }}>
          <Button variant="outline" size="md" leftIcon={<RefreshCw size={16} />} onClick={onRetry}>
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
