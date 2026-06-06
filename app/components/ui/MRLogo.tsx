import React from 'react';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface MRLogoProps {
  size?: LogoSize;
  showText?: boolean;
  animated?: boolean;
  className?: string;
  textClassName?: string;
  dark?: boolean;
}

const sizeMap: Record<LogoSize, { icon: string; text: string; gap: string }> = {
  xs: { icon: '2.125rem', text: 'text-base', gap: 'gap-1.5' },
  sm: { icon: '2.875rem', text: 'text-xl', gap: 'gap-2' },
  md: { icon: '3.625rem', text: 'text-2xl', gap: 'gap-2.5' },
  lg: { icon: '4.875rem', text: 'text-3xl', gap: 'gap-3' },
  xl: { icon: '6.875rem', text: 'text-5xl', gap: 'gap-4' },
};

export const MRLogo: React.FC<MRLogoProps> = ({
  size = 'sm',
  showText = true,
  animated = true,
  className = '',
  textClassName = '',
  dark = false,
}) => {
  const s = sizeMap[size];
  const iconSize = s.icon;

  return (
    <div className={`flex items-center ${s.gap} ${className}`} style={{ direction: 'ltr' }}>
      {/* Logo Image */}
      <div
        className={`relative shrink-0 ${animated ? 'logo-float' : ''}`}
        style={{ width: iconSize, height: iconSize }}
      >
        <img
          src="/logo.png"
          alt="Mina Rent"
          width={iconSize}
          height={iconSize}
          className={`${animated ? 'logo-icon-hover' : ''} drop-shadow-md rounded-lg object-contain`}
          style={{ width: iconSize, height: iconSize }}
          loading="eager"
        />
      </div>

      {/* Text Branding with Premium Dual Fonts */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1 select-none">
            {/* Cursive Luxury "Mina" */}
            <span
              style={{
                fontFamily: "'Great Vibes', cursive",
                background: "linear-gradient(135deg, #2CE2FF 0%, #00A2E2 60%, #006C9B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              className={`font-bold tracking-wide leading-none ${
                size === 'xs' ? 'text-[1.375rem]' : 
                size === 'sm' ? 'text-[2rem]' : 
                size === 'md' ? 'text-[2.375rem]' : 
                size === 'lg' ? 'text-[3.125rem]' : 
                'text-[4rem]'
              }`}
            >
              Mina
            </span>

            {/* Classical Serif "Rent" */}
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                background: "linear-gradient(135deg, #FFEAA7 0%, #D4AF37 50%, #AA7C11 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              className={`font-bold tracking-wider leading-none ml-1 ${
                size === 'xs' ? 'text-[0.9375rem] translate-y-[-0.125rem]' : 
                size === 'sm' ? 'text-[1.375rem] translate-y-[-0.1875rem]' : 
                size === 'md' ? 'text-[1.625rem] translate-y-[-0.25rem]' : 
                size === 'lg' ? 'text-[2.125rem] translate-y-[-0.3125rem]' : 
                'text-[2.875rem] translate-y-[-0.375rem]'
              } ${textClassName}`}
            >
              Rent
            </span>
          </div>

          {/* Subtitle/Motto line for premium feel */}
          {(size === 'sm' || size === 'md' || size === 'lg' || size === 'xl') && (
            <div className="flex flex-col select-none mt-1">
              <span
                style={{
                  fontSize: size === 'sm' ? '0.4375rem' : size === 'md' ? '0.5rem' : size === 'lg' ? '0.625rem' : '0.8125rem',
                  letterSpacing: '0.18em',
                  color: '#D4AF37',
                  fontFamily: "'Inter', sans-serif",
                }}
                className="uppercase font-bold opacity-90 tracking-widest whitespace-nowrap"
              >
                Exclusive Stays. Endless Memories.
              </span>
              
              {/* Extra branding row for larger sizes */}
              {(size === 'lg' || size === 'xl') && (
                <span
                  style={{
                    fontSize: size === 'lg' ? '0.46875rem' : '0.59375rem',
                    letterSpacing: '0.24em',
                    color: '#00A2E2',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  className="uppercase font-semibold tracking-widest mt-0.5 opacity-80"
                >
                  By The Sea. For You.
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MRLogo;
