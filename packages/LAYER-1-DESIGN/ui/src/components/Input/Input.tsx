import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`levi-input-wrapper ${fullWidth ? 'levi-input-wrapper--full-width' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="levi-input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`levi-input ${error ? 'levi-input--error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="levi-input-error">{error}</span>
      )}
    </div>
  );
};
