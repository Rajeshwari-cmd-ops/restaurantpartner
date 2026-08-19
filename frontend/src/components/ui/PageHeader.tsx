import React from 'react';
import { ChevronRight } from 'lucide-react';
import './PageHeader.css';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = ['Home'],
  action,
}) => {
  return (
    <div className="fic-page-header">
      <div className="fic-page-header__left">
        <div className="fic-page-header__breadcrumbs">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span>{crumb}</span>
              {idx < breadcrumbs.length - 1 && <ChevronRight size={12} />}
            </React.Fragment>
          ))}
          <ChevronRight size={12} />
          <span className="current">{title}</span>
        </div>
        <h2 className="fic-page-header__title">{title}</h2>
        {subtitle && <p className="fic-page-header__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="fic-page-header__action">{action}</div>}
    </div>
  );
};
