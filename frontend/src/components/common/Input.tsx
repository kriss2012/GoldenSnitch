import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full min-h-[40px] px-3.5 py-2 bg-surface text-text placeholder-text-muted/60 border rounded-control transition-colors duration-140 outline-none text-sm
          ${error ? 'border-danger focus:border-danger' : 'border-border focus:border-lilac'}
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lilac
          ${className}
        `}
        {...props}
      />
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-text-muted">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
