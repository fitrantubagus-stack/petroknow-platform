import React from 'react';

interface ChandraAsriLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  theme?: 'dark' | 'light';
  wordmarkClassName?: string;
}

export const ChandraAsriLogo: React.FC<ChandraAsriLogoProps> = ({
  className = '',
  size = 28,
  showWordmark = false,
  theme = 'dark',
  wordmarkClassName = ''
}) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Chandra Asri Ocean Wave Globe Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
        aria-label="Chandra Asri Group"
      >
        <defs>
          <clipPath id="globe-clip-react">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
        </defs>
        <g clipPath="url(#globe-clip-react)">
          {/* Base Navy Background */}
          <rect width="100" height="100" fill="#172e54" />
          
          {/* Wave Ribbon 1 (Top Cyan) */}
          <path d="M-10,24 C15,14 35,32 60,22 C80,14 100,26 115,22 L115,35 C95,38 75,26 50,34 C30,40 10,28 -10,36 Z" fill="#38bdf8" />
          
          {/* Wave Ribbon 2 (Deep Navy) */}
          <path d="M-10,40 C15,32 38,48 65,38 C85,30 100,42 115,38 L115,50 C95,54 70,42 45,50 C25,56 10,44 -10,52 Z" fill="#0f2444" />
          
          {/* Wave Ribbon 3 (Teal Aqua) */}
          <path d="M-10,54 C15,48 35,62 60,54 C80,48 100,60 115,54 L115,66 C95,70 75,58 50,66 C30,72 10,60 -10,68 Z" fill="#22d3ee" />
          
          {/* Wave Ribbon 4 (Vibrant Royal Blue) */}
          <path d="M-10,70 C15,62 40,78 65,68 C85,60 100,72 115,68 L115,82 C95,86 70,72 45,82 C25,90 10,76 -10,84 Z" fill="#1d4ed8" />
          
          {/* Wave Ribbon 5 (Sky Light) */}
          <path d="M-10,85 C15,78 35,92 60,85 C80,80 100,90 115,86 L115,105 L-10,105 Z" fill="#0ea5e9" />
        </g>
      </svg>

      {showWordmark && (
        <div className={`flex flex-col leading-none ${wordmarkClassName}`}>
          <span className={`text-xs sm:text-sm font-bold tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            Chandra Asri
          </span>
          <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-cyan-400 font-semibold">
            Group
          </span>
        </div>
      )}
    </div>
  );
};
