import React, { useState } from 'react';
import { X, Minus, Square, Check, Copy } from 'lucide-react';

interface RetroWin95ModalProps {
  onExplore?: () => void;
  className?: string;
}

export const RetroWin95Modal: React.FC<RetroWin95ModalProps> = ({
  onExplore,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [closed, setClosed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('digvijay@creates.dev');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (closed) {
    return (
      <button
        onClick={() => setClosed(false)}
        className="win95-outer-border px-3 py-1 font-pixel text-[10px] text-zinc-900 flex items-center gap-1.5 hover:bg-[#d4d4d4]"
      >
        <span>📩 Restore Message.exe</span>
      </button>
    );
  }

  return (
    <div
      className={`relative win95-outer-border w-72 sm:w-84 select-none z-30 transition-transform ${className}`}
    >
      {/* 3D Push Pin pinning the dialog to the corkboard */}
      <div className="absolute -top-2.5 -left-2.5 z-40 w-4 h-4 rounded-full pin-head-red pointer-events-none">
        <div className="absolute top-2 left-1.5 w-2 h-3 bg-black/50 blur-[1px] -rotate-45" />
      </div>

      {/* Win95 Classic Blue Title Bar */}
      <div className="win95-title-bar px-2 py-1 flex items-center justify-between text-xs font-bold tracking-wide">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🎬</span>
          <span className="font-mono text-[11px]">Timeline_vFinal_04.prproj</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="win95-btn w-4 h-3.5 flex items-center justify-center p-0">
            <Minus className="w-2.5 h-2.5" />
          </button>
          <button className="win95-btn w-4 h-3.5 flex items-center justify-center p-0">
            <Square className="w-2 h-2" />
          </button>
          <button
            onClick={() => setClosed(true)}
            className="win95-btn w-4 h-3.5 flex items-center justify-center p-0 hover:bg-red-500 hover:text-white"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div className="p-4 bg-[#c0c0c0] text-black">
        <div className="flex items-start gap-3 mb-4">
          {/* Retro Dithered Video Icon */}
          <div className="w-10 h-10 shrink-0 bg-white border border-zinc-500 flex items-center justify-center text-xl shadow-inner">
            🎞️
          </div>
          <div>
            <h5 className="font-serif italic text-lg leading-tight font-semibold text-zinc-900">
              is the cut ready?
            </h5>
            <p className="font-sans text-[11px] text-zinc-700 leading-snug mt-1">
              Welcome to <strong>digvijay.creates</strong>. We craft high-retention video edits, viral storytelling, and cinematic commercials for tier-1 creators & brands.
            </p>
          </div>
        </div>

        {/* Retro Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-400">
          <button
            onClick={onExplore}
            className="win95-btn px-3 py-1.5 text-xs flex items-center gap-1 active:translate-y-0.5"
          >
            <span>[ Watch Reel ▶ ]</span>
          </button>
          <button
            onClick={handleCopy}
            className="win95-btn px-3 py-1.5 text-xs flex items-center gap-1 active:translate-y-0.5"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-700" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 opacity-60" />
                <span>[ Copy Email ]</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
