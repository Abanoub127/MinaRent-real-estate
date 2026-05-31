import { useEffect } from 'react';

export const useImageProtection = () => {
  useEffect(() => {
    // 1. Disable right-click on protected images
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.protected-image')) {
        e.preventDefault();
      }
    };

    // 2. Developer Tools Deterrent (Optional but requested)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Block Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
      if (
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.metaKey && e.altKey && e.key === 'i') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.metaKey && e.shiftKey && e.key === 'c')
      ) {
        e.preventDefault();
      }
    };

    // 3. Disable dragging of protected images globally
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.protected-image')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);
};
