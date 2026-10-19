import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleProps {
  isMuted: boolean;
  onToggle: () => void;
  /** Only the hero theatre deck carries audio, so the control lives there and fades
   *  out elsewhere. It stays mounted so the transition animates instead of popping. */
  visible?: boolean;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({
  isMuted,
  onToggle,
  visible = true,
}) => {
  return (
    <button
      onClick={onToggle}
      aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
      title={isMuted ? 'Unmute video audio (Press M)' : 'Mute video audio (Press M)'}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed top-6 right-6 md:top-8 md:right-10 z-40 group flex items-center gap-2.5 px-3.5 py-1.5 md:px-4 md:py-2 rounded-sm select-none cursor-pointer transition-all duration-300 font-mono ${
        isMuted
          ? 'bg-black/60 hover:bg-black/90 border border-white/20 hover:border-[#ff0000]/60 text-white/70 hover:text-white'
          : 'bg-black/80 hover:bg-black border border-[#ff0000] text-white shadow-[0_0_18px_rgba(255,0,0,0.35)]'
      } backdrop-blur-md active:scale-95 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      {/* Dynamic 4-bar Equalizer Visualizer. Every bar shares the same 14px base
          height (h-3.5) because the animation scales rather than resizes; the
          keyframes scale down to the px values these bars used to animate to. */}
      <div className="flex items-end gap-[3px] h-3.5 w-3.5 overflow-hidden" aria-hidden="true">
        <span
          className={`w-[2.5px] rounded-full transition-all duration-300 ${
            !isMuted
              ? 'bg-[#ff0000] animate-eq-1 h-3.5'
              : 'h-[3px] bg-white/40 group-hover:bg-[#ff0000]/70'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full transition-all duration-300 ${
            !isMuted
              ? 'bg-[#ff0000] animate-eq-2 h-3.5'
              : 'h-[3px] bg-white/40 group-hover:bg-[#ff0000]/70'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full transition-all duration-300 ${
            !isMuted
              ? 'bg-[#ff0000] animate-eq-3 h-3.5'
              : 'h-[3px] bg-white/40 group-hover:bg-[#ff0000]/70'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full transition-all duration-300 ${
            !isMuted
              ? 'bg-[#ff0000] animate-eq-4 h-3.5'
              : 'h-[3px] bg-white/40 group-hover:bg-[#ff0000]/70'
          }`}
        />
      </div>

      {/* Volume Icon */}
      {isMuted ? (
        <VolumeX className="w-3.5 h-3.5 text-white/60 group-hover:text-[#ff0000] transition-colors" />
      ) : (
        <Volume2 className="w-3.5 h-3.5 text-[#ff0000] animate-pulse" />
      )}

      {/* Typography Indicator */}
      <span className="text-[11px] font-bold tracking-widest flex items-center gap-1.5 uppercase">
        <span>SOUND</span>
        <span
          className={`px-1 py-0.2 rounded text-[10px] tracking-wider transition-colors ${
            !isMuted
              ? 'bg-[#ff0000] text-white font-black'
              : 'bg-white/10 text-white/50 group-hover:text-white'
          }`}
        >
          {isMuted ? 'OFF' : 'ON'}
        </span>
      </span>

      {/* Subtle Keyboard Shortcut Badge */}
      <span className="hidden sm:inline-block text-[9px] text-white/30 group-hover:text-white/50 tracking-tighter pl-0.5 border-l border-white/15 ml-0.5">
        M
      </span>
    </button>
  );
};
