import React from 'react';
import './Toggle.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  sublabel,
  size = 'md',
  disabled = false,
}) => {
  return (
    <label className={`fic-toggle-container fic-toggle--${size} ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="fic-toggle__input"
      />
      <span className={`fic-toggle__track ${checked ? 'checked' : ''}`}>
        <span className="fic-toggle__thumb" />
      </span>
      {(label || sublabel) && (
        <span className="fic-toggle__labels">
          {label && <span className="fic-toggle__title">{label}</span>}
          {sublabel && <span className="fic-toggle__sub">{sublabel}</span>}
        </span>
      )}
    </label>
  );
};
