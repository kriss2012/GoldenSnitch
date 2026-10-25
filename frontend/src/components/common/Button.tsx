import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cyan' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  pill = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan active:scale-[0.98]';

  const shapeClass = pill ? 'rounded-full' : 'rounded-xl';

  const sizeStyles = {
    sm: 'min-h-[34px] px-3.5 py-1 text-xs',
    md: 'min-h-[40px] px-4 py-2 text-sm',
    lg: 'min-h-[46px] px-6 py-2.5 text-base',
  };

  const variantStyles = {
    // Primary Cyan Action
    primary: 'bg-[#82EAF4] text-[#0B0B0B] font-semibold hover:bg-[#64E8F2] shadow-[0_0_15px_rgba(130,234,244,0.30)] hover:shadow-[0_0_22px_rgba(130,234,244,0.45)]',
    cyan: 'bg-[#82EAF4] text-[#0B0B0B] font-semibold hover:bg-[#64E8F2] shadow-[0_0_15px_rgba(130,234,244,0.30)]',
    // Elevated Charcoal Secondary Action
    secondary: 'bg-[#2B2B2B] border border-[#353535] text-[#F5F5F5] hover:border-[#82EAF4]/50 hover:text-[#82EAF4] shadow-[0_2px_10px_rgba(0,0,0,0.3)]',
    outline: 'bg-transparent border border-[#353535] text-[#F5F5F5] hover:bg-[#2B2B2B] hover:border-[#82EAF4]/40',
    danger: 'bg-transparent border border-red-500/60 text-red-400 hover:bg-red-500 hover:text-black',
    ghost: 'bg-transparent text-[#B8B8B8] hover:text-[#F5F5F5] hover:bg-[#242424]',
  };

  return (
    <button
      className={`${baseStyles} ${shapeClass} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
