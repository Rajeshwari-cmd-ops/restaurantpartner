import React from 'react';
import { ChevronDown } from 'lucide-react';
import './Input.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`fic-input-group ${error ? 'fic-input-group--error' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="fic-input-group__label">
          {label}
        </label>
      )}
      <div className="fic-input-group__wrapper">
        <select
          id={selectId}
          className={`fic-input-group__control has-right-icon ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="fic-input-group__icon fic-input-group__icon--right" style={{ pointerEvents: 'none' }}>
          <ChevronDown size={18} />
        </span>
      </div>
      {error && <p className="fic-input-group__error">{error}</p>}
    </div>
  );
};
