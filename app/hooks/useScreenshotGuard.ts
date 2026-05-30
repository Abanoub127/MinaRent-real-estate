import { useEffect } from 'react';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';

export const useScreenshotGuard = () => {
  const { language } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText(''); // Clear clipboard attempt
        e.preventDefault();
        toast.error(
          language === 'en' 
            ? 'Screenshots are disabled for security reasons.' 
            : 'لا يمكن التقاط لقطة شاشة حفاظًا على خصوصية البيانات.'
        );
      }
      
      // Windows Snipping Tool shortcut (Win + Shift + S)
      if (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        navigator.clipboard.writeText('');
        toast.error(
          language === 'en' 
            ? 'Screenshots are disabled for security reasons.' 
            : 'لا يمكن التقاط لقطة شاشة حفاظًا على خصوصية البيانات.'
        );
      }

      // Mac Screenshot shortcuts (Cmd + Shift + 3/4/5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        toast.error(
          language === 'en' 
            ? 'Screenshots are disabled for security reasons.' 
            : 'لا يمكن التقاط لقطة شاشة حفاظًا على خصوصية البيانات.'
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [language]);
};
