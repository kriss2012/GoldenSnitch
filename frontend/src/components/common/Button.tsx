import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-control transition-colors duration-140 select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lilac';

  const sizeStyles = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs',
    md: 'min-h-[40px] px-4 py-2 text-sm',
    lg: 'min-h-[48px] px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: 'bg-violet text-white hover:bg-lilac hover:text-black active:bg-violet-pressed shadow-[0_0_16px_rgba(155,48,255,0.4)] hover:shadow-[0_0_22px_rgba(209,135,255,0.6)] font-semibold',
    secondary: 'bg-surface/60 border border-lilac/70 text-lilac hover:bg-violet hover:text-white hover:border-violet shadow-[0_0_10px_rgba(155,48,255,0.15)]',
    danger: 'bg-transparent border border-danger text-danger hover:bg-danger hover:text-black',
    ghost: 'bg-transparent text-text-muted hover:text-text hover:bg-surface',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
