import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  // Removed body.style.overflow = 'hidden' to fix mobile scrolling issues.
  // Using overscroll-contain on the scrollable container instead.

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        style={{ touchAction: 'none' }}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative bg-[var(--card)] sm:rounded-2xl rounded-t-2xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col border border-[var(--border)]`}
        style={{ maxHeight: '90dvh' }}
      >
        {title && (
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h3 className="text-lg font-bold text-[var(--foreground)]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[var(--secondary)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Scrollable Content */}
        <div 
          className="px-5 py-4 overflow-y-auto flex-1 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>
        
        {footer && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-[var(--border)] flex justify-end gap-3 bg-[var(--card)] sm:rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
