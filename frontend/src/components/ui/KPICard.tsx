import React from 'react';
import './KPICard.css';

export interface KPICardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent?: 'blue' | 'yellow' | 'green' | 'purple' | 'red';
  subtext?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  accent = 'red',
  subtext,
  badge,
  onClick,
}) => {
  return (
    <div className={`fic-kpi-card fic-kpi-card--${accent}`} onClick={onClick}>
      <div className="fic-kpi-card__header">
        <div className="fic-kpi-card__title-group">
          <div className="fic-kpi-icon-box">{icon}</div>
          <span className="fic-kpi-card__title">{title}</span>
        </div>
        {badge}
      </div>

      <div className="fic-kpi-card__body">
        <div className="fic-kpi-card__value">{value}</div>
        {subtext && <div className="fic-kpi-card__subtext">{subtext}</div>}
      </div>
    </div>
  );
};
