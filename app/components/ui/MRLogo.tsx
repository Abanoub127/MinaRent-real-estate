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

const sizeMap: Record<LogoSize, { icon: number; text: string; gap: string }> = {
  xs: { icon: 34, text: 'text-base', gap: 'gap-1.5' },
  sm: { icon: 46, text: 'text-xl', gap: 'gap-2' },
  md: { icon: 58, text: 'text-2xl', gap: 'gap-2.5' },
  lg: { icon: 78, text: 'text-3xl', gap: 'gap-3' },
  xl: { icon: 110, text: 'text-5xl', gap: 'gap-4' },
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
    <div className={`flex items-center ${s.gap} ${className}`}>
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
                size === 'xs' ? 'text-[22px]' : 
                size === 'sm' ? 'text-[32px]' : 
                size === 'md' ? 'text-[38px]' : 
                size === 'lg' ? 'text-[50px]' : 
                'text-[64px]'
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
                size === 'xs' ? 'text-[15px] translate-y-[-2px]' : 
                size === 'sm' ? 'text-[22px] translate-y-[-3px]' : 
                size === 'md' ? 'text-[26px] translate-y-[-4px]' : 
                size === 'lg' ? 'text-[34px] translate-y-[-5px]' : 
                'text-[46px] translate-y-[-6px]'
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
                  fontSize: size === 'sm' ? '7px' : size === 'md' ? '8px' : size === 'lg' ? '10px' : '13px',
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
                    fontSize: size === 'lg' ? '7.5px' : '9.5px',
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
