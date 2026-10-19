import React from 'react';

export const RedStringLayer: React.FC = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible hidden md:block"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="string-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.65" />
        </filter>
      </defs>

      {/* String 1: Top-Left Note Pin (150, 128) -> Center Stencil Pin (588, 425) */}
      <path
        d="M 150,128 Q 320,320 588,425"
        stroke="#dc2626"
        strokeWidth="2.5"
        fill="none"
        filter="url(#string-shadow)"
        strokeLinecap="round"
      />

      {/* String 2: Center Stencil Pin (588, 425) -> Bottom-Left Note Pin (390, 680) */}
      <path
        d="M 588,425 Q 460,580 390,680"
        stroke="#dc2626"
        strokeWidth="2.5"
        fill="none"
        filter="url(#string-shadow)"
        strokeLinecap="round"
      />

      {/* String 3: Center Pin (588, 425) -> Top-Right Note Pin (1130, 118) */}
      <path
        d="M 588,425 Q 860,260 1130,118"
        stroke="#dc2626"
        strokeWidth="2.5"
        fill="none"
        filter="url(#string-shadow)"
        strokeLinecap="round"
      />

      {/* String 4: Top-Right Note Pin (1130, 118) -> Bottom-Right Action Card (1050, 620) */}
      <path
        d="M 1130,118 Q 1200,380 1050,620"
        stroke="#dc2626"
        strokeWidth="2.5"
        fill="none"
        filter="url(#string-shadow)"
        strokeLinecap="round"
      />
    </svg>
  );
};
