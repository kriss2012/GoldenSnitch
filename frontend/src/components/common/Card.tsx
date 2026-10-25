import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'plum' | 'danger';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variantClasses = {
    // Charcoal and elevated design tokens
    default: 'bg-[#242424] border-[#353535] hover:border-[#788B8D]/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
    elevated: 'bg-[#2B2B2B] border-[#353535] hover:border-[#82EAF4]/50 shadow-[0_6px_25px_rgba(0,0,0,0.5)]',
    plum: 'bg-[#242424] border-[#353535] hover:border-[#82EAF4]/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
    danger: 'bg-[#242424] border-red-500/50 shadow-[0_4px_20px_rgba(239,68,68,0.15)]',
  };

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-150 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-[#353535]">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[#F5F5F5] font-heading leading-tight tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#B8B8B8] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
