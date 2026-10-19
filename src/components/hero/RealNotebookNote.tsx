import React from 'react';

export interface RealNotebookNoteProps {
  id?: string;
  paperColor?: 'cream' | 'yellow' | 'blue';
  title?: string;
  subtitle?: string;
  details?: string[];
  statusBadge?: string;
  rotation?: string;
  className?: string;
  hasPin?: boolean;
  pinColor?: 'red' | 'blue';
  pinPos?: 'top-center' | 'top-left' | 'top-right';
  tapeColor?: 'kraft' | 'scotch' | 'none';
  children?: React.ReactNode;
}

export const RealNotebookNote: React.FC<RealNotebookNoteProps> = ({
  id,
  paperColor = 'cream',
  title,
  subtitle,
  details,
  statusBadge,
  rotation = 'rotate-2',
  className = '',
  hasPin = false,
  pinColor = 'red',
  pinPos = 'top-center',
  tapeColor = 'kraft',
  children,
}) => {
  const punchHoles = Array.from({ length: 9 }, (_, i) => i);

  const paperStyles = {
    cream: {
      bg: 'bg-[#fbf8f1]',
      border: 'border-[#e8e2d2]',
      spineBg: 'bg-[#f7f3e8]',
      spineBorder: 'border-[#ece5d4]',
      line: 'rgba(135, 115, 95, 0.18)',
      marginLine: 'bg-rose-400/20',
      slitColor: 'bg-[#121316]',
      holeBorder: 'border-[#c4baa2]/60',
    },
    yellow: {
      bg: 'bg-[#fefce8]',
      border: 'border-[#fef08a]',
      spineBg: 'bg-[#fef9c3]',
      spineBorder: 'border-[#fde047]/60',
      line: 'rgba(161, 98, 7, 0.16)',
      marginLine: 'bg-red-400/25',
      slitColor: 'bg-[#121316]',
      holeBorder: 'border-[#ca8a04]/50',
    },
    blue: {
      bg: 'bg-[#f0f9ff]',
      border: 'border-[#bae6fd]',
      spineBg: 'bg-[#e0f2fe]',
      spineBorder: 'border-[#7dd3fc]/60',
      line: 'rgba(2, 132, 199, 0.15)',
      marginLine: 'bg-sky-400/25',
      slitColor: 'bg-[#121316]',
      holeBorder: 'border-[#0284c7]/50',
    },
  };

  const theme = paperStyles[paperColor];

  const pinPosStyles = {
    'top-center': 'top-[-8px] left-1/2 -translate-x-1/2',
    'top-left': 'top-[-8px] left-4',
    'top-right': 'top-[-8px] right-4',
  };

  return (
    <div
      id={id}
      className={`relative select-none transition-transform duration-200 hover:scale-[1.02] hover:z-30 cursor-default ${rotation} ${className}`}
    >
      {/* --- Realistic Curled Paper Bottom-Right Shadow --- */}
      <div 
        className="absolute -bottom-1.5 right-2 w-4/5 h-8 bg-black/55 blur-md rounded-full pointer-events-none transform rotate-2 skew-x-3 origin-bottom-right" 
      />
      <div 
        className="absolute bottom-0.5 right-1 w-1/2 h-6 bg-black/40 blur-sm rounded-full pointer-events-none transform rotate-3" 
      />

      {/* --- Top Masking Tape --- */}
      {tapeColor === 'kraft' && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="relative w-20 sm:w-24 h-7 -rotate-1 shadow-sm">
            <div 
              className="w-full h-full bg-[#c68e3f]/85 backdrop-blur-[0.5px] border-t border-b border-[#dfab5c]/40 shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
              style={{
                backgroundImage: `radial-gradient(rgba(0,0,0,0.06) 1px, transparent 0), linear-gradient(90deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)`,
                backgroundSize: '3px 3px, 100% 100%',
                clipPath: 'polygon(0% 4%, 3% 0%, 97% 2%, 100% 6%, 98% 95%, 95% 100%, 3% 97%, 0% 92%)',
              }}
            />
            <div className="absolute inset-x-1 bottom-0 h-1.5 bg-black/15 blur-[0.5px]" />
          </div>
        </div>
      )}

      {tapeColor === 'scotch' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-16 h-5 tape-strip -rotate-2" />
      )}

      {/* --- 3D Push Pin --- */}
      {hasPin && (
        <div
          data-pin={id}
          className={`absolute z-40 w-4 h-4 rounded-full ${
            pinColor === 'red' ? 'pin-head-red' : 'pin-head-blue'
          } ${pinPosStyles[pinPos]}`}
        >
          <div className="absolute top-2 left-1.5 w-2 h-3.5 bg-black/50 blur-[1px] -rotate-45 pointer-events-none" />
        </div>
      )}

      {/* --- Main Notebook Paper Container --- */}
      <div 
        className={`relative flex ${theme.bg} rounded-[2px] overflow-hidden border ${theme.border}`}
        style={{
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* --- Left Torn Spiral Spine with Punch Holes --- */}
        <div className={`relative w-8 shrink-0 ${theme.spineBg} border-r ${theme.spineBorder} flex flex-col justify-between py-3.5 select-none overflow-hidden`}>
          {/* Faint Jagged Torn Outer Left Fringe */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent border-r border-dashed border-black/10" />

          {/* Punched Holes with Rips */}
          {punchHoles.map((hole) => (
            <div key={hole} className="relative flex items-center h-5 my-0.5">
              {/* Torn slit leading from edge to hole */}
              <div className={`absolute left-0 w-2.5 h-[1.5px] ${theme.slitColor} opacity-75`} />
              {/* The Binder Punch Hole */}
              <div 
                className={`ml-2 w-3.5 h-3 bg-[#121316] rounded-[2px] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.85)] border ${theme.holeBorder}`} 
              />
            </div>
          ))}
        </div>

        {/* --- Ruled Lined Notebook Body --- */}
        <div 
          className="flex-1 p-4 pt-5 pb-4 relative"
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 25px, ${theme.line} 26px)`,
            backgroundPosition: '0 18px',
          }}
        >
          {/* Faint vertical margin line */}
          <div className={`absolute left-2 top-0 bottom-0 w-[1px] ${theme.marginLine} pointer-events-none`} />

          {/* Title */}
          {title && (
            <h4 className="font-handwriting font-bold text-2xl leading-none text-zinc-900 tracking-wide mb-1">
              {title}
            </h4>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className="font-handwriting text-base leading-snug text-zinc-700 italic mb-2">
              {subtitle}
            </p>
          )}

          {/* Details / Bullets */}
          {details && details.length > 0 && (
            <ul className="space-y-1 mb-2">
              {details.map((item, i) => (
                <li 
                  key={i} 
                  className="font-handwriting text-sm text-zinc-800 leading-snug flex items-center gap-1.5"
                >
                  <span className="text-zinc-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Status Badge */}
          {statusBadge && (
            <div className="mt-2 pt-2 border-t border-dashed border-zinc-300/80 flex items-center gap-1.5 font-handwriting text-base font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{statusBadge}</span>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};
