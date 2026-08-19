import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const classes = [
    'fic-btn',
    `fic-btn--${variant}`,
    `fic-btn--${size}`,
    fullWidth ? 'fic-btn--full' : '',
    isLoading ? 'fic-btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <Loader2 className="fic-btn__spinner animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : (
        leftIcon && <span className="fic-btn__icon fic-btn__icon--left">{leftIcon}</span>
      )}
      <span className="fic-btn__text">{children}</span>
      {!isLoading && rightIcon && <span className="fic-btn__icon fic-btn__icon--right">{rightIcon}</span>}
    </button>
  );
};
