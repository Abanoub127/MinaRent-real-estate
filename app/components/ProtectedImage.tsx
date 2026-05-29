import React, { useEffect, useState } from 'react';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  watermarkText?: string;
}

export const ProtectedImage: React.FC<ProtectedImageProps> = ({
  src,
  alt = 'Real Estate',
  className = '',
  containerClassName = '',
  watermarkText = 'MINA RENT',
  ...props
}) => {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Prevent screenshot keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCopy = e.ctrlKey && (e.key === 'c' || e.key === 'C');
      const isSave = e.ctrlKey && (e.key === 's' || e.key === 'S');
      const isPrint = e.ctrlKey && (e.key === 'p' || e.key === 'P');
      const isPrintScreen = e.key === 'PrintScreen';

      if (isCopy || isSave || isPrint || isPrintScreen) {
        e.preventDefault();
      }
    };

    // Mobile screenshot mitigation: blur screen when app goes to background / switches
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsBlurred(true);
      }
    };

    const handleFocus = () => {
      // Keep it blurred for 800ms after focus return to deter continuous screenshotting
      setTimeout(() => setIsBlurred(false), 800);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden select-none ${containerClassName}`}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Transparent pointer-events overlay blocking mouse interactions with the raw image element */}
      <div 
        className="absolute inset-0 z-10 bg-transparent cursor-default" 
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* Elegant, repeating diagonal watermark grid */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex flex-wrap justify-around items-center select-none opacity-[0.06] dark:opacity-[0.04]">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="text-[9px] sm:text-[11px] font-semibold tracking-widest uppercase rotate-[-28deg] m-3 text-slate-700 dark:text-slate-300 font-sans"
          >
            {watermarkText}
          </span>
        ))}
      </div>

      {/* The actual image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ${
          isBlurred ? 'blur-xl scale-105' : 'blur-0'
        } ${className}`}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        draggable="false"
        {...props}
      />
    </div>
  );
};
