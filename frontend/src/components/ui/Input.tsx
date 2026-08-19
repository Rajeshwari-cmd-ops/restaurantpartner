import React from 'react';
import { Search, X } from 'lucide-react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`fic-input-group ${error ? 'fic-input-group--error' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="fic-input-group__label">
            {label}
          </label>
        )}
        <div className="fic-input-group__wrapper">
          {leftIcon && <span className="fic-input-group__icon fic-input-group__icon--left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`fic-input-group__control ${leftIcon ? 'has-left-icon' : ''} ${rightIcon ? 'has-right-icon' : ''} ${className}`}
            {...props}
          />
          {rightIcon && <span className="fic-input-group__icon fic-input-group__icon--right">{rightIcon}</span>}
        </div>
        {error ? (
          <p className="fic-input-group__error">{error}</p>
        ) : helperText ? (
          <p className="fic-input-group__helper">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search orders, items, customers...',
  className = '',
  ...props
}) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      leftIcon={<Search size={18} />}
      rightIcon={
        value ? (
          <button
            type="button"
            className="fic-search-clear"
            onClick={() => {
              onChange('');
              if (onClear) onClear();
            }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null
      }
      className={className}
      {...props}
    />
  );
};
