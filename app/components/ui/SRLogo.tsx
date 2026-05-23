import React from 'react';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SRLogoProps {
  size?: LogoSize;
  showText?: boolean;
  animated?: boolean;
  className?: string;
  textClassName?: string;
  dark?: boolean;
}

const sizeMap: Record<LogoSize, { icon: number; text: string; gap: string }> = {
  xs: { icon: 34, text: 'text-base', gap: 'gap-2' },
  sm: { icon: 46, text: 'text-xl', gap: 'gap-2.5' },
  md: { icon: 58, text: 'text-2xl', gap: 'gap-3' },
  lg: { icon: 78, text: 'text-3xl', gap: 'gap-4' },
  xl: { icon: 110, text: 'text-5xl', gap: 'gap-5' },
};

export const SRLogo: React.FC<SRLogoProps> = ({
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
      {/* Dynamic 3D Luxury Coastal Logo */}
      <div
        className={`relative shrink-0 ${animated ? 'logo-float' : ''}`}
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={iconSize}
          height={iconSize}
          className={`${animated ? 'logo-icon-hover' : ''} drop-shadow-md`}
        >
          <defs>
            {/* Soft Tropical Sunset Sky Gradient */}
            <linearGradient id={`sky-sunset-${size}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A8BF5" stopOpacity="0.15" />
              <stop offset="45%" stopColor="#87CEEB" stopOpacity="0.25" />
              <stop offset="75%" stopColor="#FFE4B5" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0.2" />
            </linearGradient>

            {/* Gold Premium Gradients */}
            <linearGradient id={`gold-light-${size}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF2D4" />
              <stop offset="30%" stopColor="#E5C158" />
              <stop offset="70%" stopColor="#B38F2D" />
              <stop offset="100%" stopColor="#8A6615" />
            </linearGradient>
            
            <linearGradient id={`gold-metallic-${size}`} x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFEAA7" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#AA7C11" />
            </linearGradient>

            {/* Ocean Waves & Blue Glass Monogram Gradient */}
            <linearGradient id={`ocean-blue-${size}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2CE2FF" />
              <stop offset="50%" stopColor="#00A2E2" />
              <stop offset="100%" stopColor="#006C9B" />
            </linearGradient>

            <linearGradient id={`wave-deep-${size}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B4DB" />
              <stop offset="100%" stopColor="#0083B0" />
            </linearGradient>

            {/* White Beach Sand Gradient */}
            <linearGradient id={`sand-${size}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="100%" stopColor="#F5E6CC" />
            </linearGradient>
          </defs>

          {/* 1. Background Sky Circle */}
          <circle cx="50" cy="50" r="46" fill={`url(#sky-sunset-${size})`} />

          {/* 2. Golden Crescent Frame */}
          <path
            d="M 45 4 A 46 46 0 1 1 12 28 M 46 4 A 46 46 0 0 1 88 28"
            stroke={`url(#gold-light-${size})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Inner Dotted Golden Compass/Crescent Ring */}
          <path
            d="M 45 8 A 42 42 0 1 1 16 30"
            stroke={`url(#gold-metallic-${size})`}
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.6"
            fill="none"
          />

          {/* 3. Flying Seagulls */}
          <g opacity="0.65">
            <path d="M 68 16 Q 71 13 74 16 Q 77 13 80 16" stroke={`url(#ocean-blue-${size})`} strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M 73 22 Q 75.5 19.5 78 22 Q 80.5 19.5 83 22" stroke={`url(#ocean-blue-${size})`} strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M 64 24 Q 66 22 68 24 Q 70 22 72 24" stroke={`url(#ocean-blue-${size})`} strokeWidth="0.7" strokeLinecap="round" fill="none" />
          </g>

          {/* 4. Luxury Palm Tree */}
          <g>
            {/* Palm Trunk */}
            <path
              d="M 28 72 C 26 58, 22 45, 30 32 C 27 45, 29 58, 31 72 Z"
              fill={`url(#gold-metallic-${size})`}
            />
            {/* Palm Leaves / Fronds */}
            <g transform="translate(30, 32)">
              {/* Top Leaves */}
              <path d="M 0 0 Q -10 -5, -22 -6 Q -12 2, 0 0 Z" fill={`url(#gold-light-${size})`} />
              <path d="M 0 0 Q -5 -12, -14 -20 Q -6 -6, 0 0 Z" fill={`url(#gold-metallic-${size})`} />
              <path d="M 0 0 Q 6 -12, 14 -22 Q 6 -6, 0 0 Z" fill={`url(#gold-light-${size})`} opacity="0.9" />
              <path d="M 0 0 Q 15 -6, 24 -4 Q 12 2, 0 0 Z" fill={`url(#gold-metallic-${size})`} />
              <path d="M 0 0 Q 12 10, 18 20 Q 8 8, 0 0 Z" fill={`url(#gold-light-${size})`} opacity="0.8" />
              {/* Lower hanging leaves */}
              <path d="M 0 0 Q -12 6, -18 16 Q -8 6, 0 0 Z" fill={`url(#gold-metallic-${size})`} opacity="0.8" />
            </g>
            {/* Tiny Coconuts */}
            <circle cx="28.5" cy="33.5" r="1.5" fill={`url(#gold-light-${size})`} />
            <circle cx="31.5" cy="34" r="1.5" fill={`url(#gold-light-${size})`} />
          </g>

          {/* 5. Modern Beach Villa (Sits under monogram, behind waves) */}
          <g transform="translate(1, -2)">
            {/* Villa Ground / Foundation */}
            <path d="M 38 68 L 68 68 L 68 64 L 38 64 Z" fill={`url(#sand-${size})`} opacity="0.9" />
            {/* Villa Base / Core structure */}
            <rect x="42" y="52" width="22" height="12" rx="1" fill="#FFFFFF" stroke={`url(#gold-metallic-${size})`} strokeWidth="0.5" />
            <rect x="46" y="44" width="14" height="9" rx="1" fill="#FFFFFF" stroke={`url(#gold-metallic-${size})`} strokeWidth="0.5" opacity="0.95" />
            
            {/* Glass Panels / Balconies */}
            <rect x="43" y="54" width="9" height="9" fill={`url(#ocean-blue-${size})`} opacity="0.35" />
            <rect x="54" y="54" width="9" height="9" fill={`url(#ocean-blue-${size})`} opacity="0.35" />
            <rect x="47" y="46" width="12" height="6" fill={`url(#ocean-blue-${size})`} opacity="0.4" />
            
            {/* Balcony Railings */}
            <line x1="46" y1="52" x2="60" y2="52" stroke={`url(#gold-light-${size})`} strokeWidth="0.7" />
            <line x1="42" y1="63" x2="64" y2="63" stroke={`url(#gold-light-${size})`} strokeWidth="0.5" />

            {/* Beach Parasol / Umbrella next to Villa */}
            <path d="M 36 64 L 36 57 M 33 57 Q 36 53, 39 57 Z" stroke={`url(#gold-light-${size})`} strokeWidth="0.75" fill={`url(#ocean-blue-${size})`} />
            <path d="M 34 64 L 38 62" stroke={`url(#gold-light-${size})`} strokeWidth="0.75" />
          </g>

          {/* 6. Interlocking S & R Monogram (The centerpiece) */}
          <g transform="translate(-1, 0)">
            {/* Golden Letter 'M' */}
            <path
              d="M 32 50 L 32 20 L 42 38 L 52 20 L 52 50"
              stroke={`url(#gold-metallic-${size})`}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="drop-shadow-md"
            />
            {/* Inner highlights to give 'M' 3D bevel look */}
            <path
              d="M 32 50 L 32 20 L 42 38 L 52 20 L 52 50"
              stroke="#FFFDF0"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.8"
            />

            {/* Interlocking Glassy Blue/Teal 'R' */}
            {/* Back Stem of R */}
            <path
              d="M 50 18 L 50 50"
              stroke={`url(#ocean-blue-${size})`}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              className="drop-shadow-sm"
            />
            {/* Loop and Leg of R */}
            <path
              d="M 50 18 
                 C 63 18, 65 31, 51 32
                 L 64 52"
              stroke={`url(#ocean-blue-${size})`}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="drop-shadow-md"
            />
            {/* Inner highlights to give 'R' a 3D glass look */}
            <path
              d="M 50 18 C 63 18, 65 31, 51 32 L 64 52"
              stroke="#E0F7FA"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />
          </g>

          {/* 7. Ocean Waves at Bottom (Layered 3D Ribbons) */}
          {/* Wave 3 (Deep/Back) */}
          <path
            d="M 4 72 Q 22 66, 44 74 T 96 72 L 96 96 L 4 96 Z"
            fill={`url(#wave-deep-${size})`}
            opacity="0.6"
          />
          {/* Wave 2 (Middle) */}
          <path
            d="M 4 78 Q 25 70, 50 82 T 96 76 L 96 96 L 4 96 Z"
            fill={`url(#ocean-blue-${size})`}
            opacity="0.85"
          />
          {/* Wave 1 (Foreground/Front) */}
          <path
            d="M 4 84 Q 28 78, 54 86 T 96 82 L 96 96 L 4 96 Z"
            fill={`url(#ocean-blue-${size})`}
          />
          {/* Wave Foam lines */}
          <path
            d="M 4 84 Q 28 78, 54 86 T 96 82"
            stroke="#E0FFFF"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </svg>
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

export default SRLogo;
