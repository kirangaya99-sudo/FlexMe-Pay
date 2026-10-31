import React from 'react';

interface FlexMeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const FlexMeLogo: React.FC<FlexMeLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const textSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const badgeSize = {
    sm: 'text-[9px] px-1 py-0.2',
    md: 'text-[10px] px-1.5 py-0.5',
    lg: 'text-xs px-2 py-0.5',
    xl: 'text-sm px-2.5 py-1',
  }[size];

  return (
    <div className={`flex items-center gap-3 shrink-0 group select-none ${className}`}>
      
      {/* Premium Stylized Vector Icon */}
      <div className={`relative ${iconDimensions} shrink-0`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-500 to-indigo-500 blur-md opacity-40 group-hover:opacity-75 transition-opacity"></div>
        
        {/* Main Icon Body */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-white/20 shadow-lg p-1.5 flex items-center justify-center overflow-hidden">
          
          {/* Subtle Grid / Circuit Lines Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:6px_6px] opacity-20"></div>

          {/* Stylized FM / Lightning Vector Mark */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_2px_8px_rgba(168,85,247,0.5)] transition-transform duration-300 group-hover:scale-105"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="fmGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="fmGradAccent" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="fmGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Geometric F Shape with Speed Wing */}
            <path
              d="M20 22 C20 18.686 22.686 16 26 16 H68 C71.314 16 73.5 19.5 72 22.5 L65 36 H38 L34 50 H56 C59.314 50 61.5 53.5 60 56.5 L55 66 H30 L23 82 C21.8 84.5 18 83.5 18 80.5 Z"
              fill="url(#fmGradPrimary)"
            />

            {/* Overlapping Dynamic "M" & Arrow Shape */}
            <path
              d="M48 36 L70 36 C73 36 75 39 74 42 L66 60 L78 60 C81.5 60 83.5 64 81.5 67 L68 84 C66 86.5 62 84.5 63 81.5 L67 72 H55 C52 72 50 69 51 66 L58 50 H46 Z"
              fill="url(#fmGradAccent)"
            />

            {/* Sparkle Dot */}
            <circle cx="78" cy="22" r="5" fill="#38bdf8" className="animate-pulse" />
            <circle cx="78" cy="22" r="2.5" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Typography Wordmark */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`${textSize} font-black tracking-tight text-slate-900 dark:text-white`}>
              Flex<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-black">Me</span>
            </span>
            <span className={`${badgeSize} font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-300 rounded-md bg-pink-50 dark:bg-pink-950/70 border border-pink-200 dark:border-pink-800 shadow-2xs`}>
              PAY
            </span>
          </div>

          {showSubtitle && (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide mt-0.5">
              PlayStore & Server Pass · <strong className="text-slate-700 dark:text-slate-300 font-bold">@flexme.pay</strong>
            </span>
          )}
        </div>
      )}

    </div>
  );
};
