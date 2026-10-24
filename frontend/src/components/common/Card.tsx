import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'plum' | 'danger';
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
    default: 'bg-surface/95 border-border/80 shadow-[0_4px_24px_rgba(20,0,38,0.6)] hover:border-violet/40 transition-colors',
    plum: 'bg-surface border-plum shadow-[0_0_18px_rgba(98,10,150,0.3)]',
    danger: 'bg-surface border-danger/60',
  };

  return (
    <div
      className={`rounded-panel border p-5 transition-colors duration-140 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-border/50">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-text font-heading leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-text-muted mt-0.5">
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
