import React from 'react';

interface MrPocketLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const MrPocketLogo: React.FC<MrPocketLogoProps> = ({
  className = '',
  size = 48,
  glow = true
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'filter drop-shadow-[0_0_8px_rgba(236,72,153,0.5)] drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]' : ''} transition-all duration-300`}
    >
      <defs>
        {/* Beautiful linear gradient starting from hot red/pink to electric royal blue */}
        <linearGradient id="mrpocketLogoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff0055" />
          <stop offset="35%" stopColor="#ec4899" />
          <stop offset="65%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#00d2ff" />
        </linearGradient>
      </defs>

      {/* The iconic overlapping double-arch ribbon structure of mrpocket */}
      <g>
        {/* 1. Main outer double arch (left and right peaks, dipping in center) */}
        <path
          d="M 18,82 C 20,52 26,30 35,30 C 43,30 47,54 50,68 C 53,54 57,30 65,30 C 74,30 80,52 82,82"
          stroke="url(#mrpocketLogoGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* 2. Middle high peak arch */}
        <path
          d="M 18,82 C 28,52 38,20 50,14 C 62,20 72,52 82,82"
          stroke="url(#mrpocketLogoGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 3. Bottom curved base ribbon connecting bottom corners with center dip */}
        <path
          d="M 18,82 C 28,84 38,78 50,68 C 62,78 72,84 82,82"
          stroke="url(#mrpocketLogoGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
};
