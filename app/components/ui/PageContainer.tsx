import * as React from 'react';
import { cn } from './utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'default' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  default: 'max-w-7xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function PageContainer({ children, className, maxWidth = 'default' }: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-5 lg:px-6 xl:px-8 py-6 sm:py-8',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}

export function PageHeader({ 
  title, 
  description, 
  action,
  className 
}: { 
  title: string; 
  description?: string; 
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}>
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{title}</h1>
        {description && (
          <p className="text-[var(--text-secondary)] text-sm mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}