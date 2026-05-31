import React, { useMemo } from 'react';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  watermarkText?: string;
  showDate?: boolean;
}

export const ProtectedImage: React.FC<ProtectedImageProps> = ({
  src,
  alt = 'Real Estate',
  className = '',
  containerClassName = '',
  watermarkText = 'Mina Rent • www.mina-rent.com',
  showDate = true,
  ...props
}) => {
  const currentDate = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, []);

  return (
    <div
      className={`protected-image relative overflow-hidden select-none ${containerClassName}`}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* The actual image with strict non-draggable properties */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 blur-0 ${className}`}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        draggable="false"
        style={{
          WebkitUserDrag: 'none',
          userSelect: 'none',
        } as React.CSSProperties}
        {...props}
      />

      {/* Transparent pointer-events overlay blocking mouse interactions with the raw image element */}
      <div 
        className="absolute inset-0 z-10 bg-transparent cursor-default" 
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* Dynamic Watermark System */}
      <div className="absolute bottom-2 right-2 z-20 pointer-events-none flex flex-col items-end opacity-70">
        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-wide">
          {watermarkText}
        </span>
        {showDate && (
          <span className="text-[8px] sm:text-[9px] font-semibold text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {currentDate}
          </span>
        )}
      </div>
    </div>
  );
};
