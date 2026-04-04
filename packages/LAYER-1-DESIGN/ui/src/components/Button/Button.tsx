import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const classNames = [
    'levi-button',
    `levi-button--${variant}`,
    `levi-button--${size}`,
    fullWidth && 'levi-button--full-width',
    loading && 'levi-button--loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="levi-button__loader"></span>
      ) : (
        children
      )}
    </button>
  );
};
