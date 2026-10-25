import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'violet' | 'emerald' | 'crimson' | 'amber' | 'outline';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'violet',
  className = '',
  children,
  ...props
}) => {
  const styles = {
    violet: 'bg-violet/25 text-lilac border border-violet/40',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    crimson: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    outline: 'bg-transparent text-text-muted border border-border',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
