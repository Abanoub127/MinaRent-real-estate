import * as React from 'react';
import { cn } from './utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    iconBg: 'bg-[var(--secondary)]',
    iconColor: 'text-[var(--foreground)]',
  },
  primary: {
    iconBg: 'bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20',
    iconColor: 'text-[var(--primary)]',
  },
  success: {
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  warning: {
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  danger: {
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
  valueClassName,
  variant = 'default',
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-6',
        'transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-secondary)] mb-2 truncate">{title}</p>
          <p className={cn('text-2xl font-bold text-[var(--foreground)]', valueClassName)}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                trend.isPositive
                  ? 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                  : 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', styles.iconBg)}>
            <span className={cn(styles.iconColor, 'w-6 h-6')}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}