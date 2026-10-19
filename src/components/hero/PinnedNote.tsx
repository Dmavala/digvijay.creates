import React from 'react';

export interface PinnedNoteProps {
  id?: string;
  color?: 'yellow' | 'blue' | 'white' | 'tag';
  pinColor?: 'red' | 'blue' | 'none';
  pinPos?: 'top-center' | 'top-left' | 'top-right';
  hasTape?: boolean;
  title?: string;
  subtitle?: string;
  details?: string[];
  rotation?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PinnedNote: React.FC<PinnedNoteProps> = ({
  id,
  color = 'yellow',
  pinColor = 'red',
  pinPos = 'top-center',
  hasTape = false,
  title,
  subtitle,
  details,
  rotation = 'rotate-[-2deg]',
  className = '',
  children,
}) => {
  const bgStyles = {
    yellow: 'bg-[#fef9c3] text-zinc-900 border border-[#fef08a]',
    blue: 'bg-[#e0f2fe] text-zinc-900 border border-[#bae6fd]',
    white: 'bg-[#fbf8f1] text-zinc-900 border border-[#e8e2d2]',
    tag: 'bg-[#fefce8] text-zinc-900 border border-[#fef08a]',
  };

  const lineStyles = {
    yellow: 'rgba(202, 138, 4, 0.12)',
    blue: 'rgba(2, 132, 199, 0.12)',
    white: 'rgba(120, 100, 80, 0.14)',
    tag: 'rgba(202, 138, 4, 0.12)',
  };

  const pinPosStyles = {
    'top-center': 'top-[-8px] left-1/2 -translate-x-1/2',
    'top-left': 'top-[-8px] left-3',
    'top-right': 'top-[-8px] right-3',
  };

  return (
    <div
      id={id}
      className={`relative select-none transition-transform duration-200 hover:scale-[1.03] hover:z-30 cursor-default ${rotation} ${className}`}
    >
      {/* Realistic Curled Bottom-Right Shadow */}
      <div 
        className="absolute -bottom-1.5 right-2 w-4/5 h-6 bg-black/45 blur-md rounded-full pointer-events-none transform rotate-2 skew-x-3" 
      />

      {/* Optional Top Kraft Tape */}
      {hasTape && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-16 h-6 -rotate-1 shadow-sm">
          <div 
            className="w-full h-full bg-[#c68e3f]/80 backdrop-blur-[0.5px] border-t border-b border-[#dfab5c]/40"
            style={{
              clipPath: 'polygon(0% 4%, 4% 0%, 96% 2%, 100% 6%, 98% 95%, 96% 100%, 4% 97%, 0% 92%)',
            }}
          />
        </div>
      )}

      {/* 3D Push Pin */}
      {pinColor !== 'none' && (
        <div
          data-pin={id}
          className={`absolute z-30 w-4 h-4 rounded-full ${
            pinColor === 'red' ? 'pin-head-red' : 'pin-head-blue'
          } ${pinPosStyles[pinPos]}`}
        >
          {/* Pushpin Needle Shadow */}
          <div className="absolute top-2 left-1.5 w-2 h-4 bg-black/50 blur-[1px] -rotate-45 pointer-events-none" />
        </div>
      )}

      {/* Note Body with Ruled Lines & Paper Feel */}
      <div 
        className={`p-4 rounded-[2px] shadow-[0_4px_14px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.2)] ${bgStyles[color]}`}
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 23px, ${lineStyles[color]} 24px)`,
          backgroundPosition: '0 16px',
        }}
      >
        {title && (
          <h4 className="font-handwriting font-bold text-2xl leading-tight tracking-wide text-zinc-900 mb-1">
            {title}
          </h4>
        )}
        {subtitle && (
          <p className="font-handwriting text-base leading-snug text-zinc-700 italic mb-2">
            {subtitle}
          </p>
        )}
        {details && details.length > 0 && (
          <ul className="space-y-0.5">
            {details.map((item, i) => (
              <li key={i} className="font-handwriting text-sm text-zinc-800 leading-snug flex items-center gap-1.5">
                <span className="text-zinc-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        {children}
      </div>
    </div>
  );
};
