import React from 'react';
import { Loader2 } from 'lucide-react';
import './StateComponents.css';

export interface LoadingStateProps {
  message?: string;
  subtext?: string;
  type?: 'spinner' | 'skeleton';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  subtext = 'Please wait while we fetch the latest records.',
  type = 'spinner',
}) => {
  if (type === 'skeleton') {
    return (
      <div className="fic-state-container fic-skeleton-wrapper">
        <div className="fic-skeleton fic-skeleton--title" />
        <div className="fic-skeleton fic-skeleton--text" />
        <div className="fic-skeleton fic-skeleton--card" />
      </div>
    );
  }

  return (
    <div className="fic-state-container">
      <div className="fic-state-icon fic-state-icon--loading">
        <Loader2 size={32} className="animate-spin" />
      </div>
      <h4 className="fic-state-title">{message}</h4>
      {subtext && <p className="fic-state-subtext">{subtext}</p>}
    </div>
  );
};
