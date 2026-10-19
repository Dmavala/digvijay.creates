import React from 'react';

export const HeroCenterpiece: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center my-4 sm:my-6 select-none">


      {/* Top Provocative Hybrid Typography (From Reference 1 tailored to Video Editing) */}
      <div className="flex flex-col items-center mb-3">
        <div className="flex items-baseline gap-2 sm:gap-3 text-2xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight">
          <span className="font-serif italic">Think</span>
          <span className="font-pixel text-3xl sm:text-5xl text-zinc-100 font-bold tracking-tighter">B</span>
          <span className="font-serif italic -ml-1">efore</span>
          <span className="font-serif">you</span>
          <span className="font-pixel text-red-400 text-3xl sm:text-5xl font-bold ml-1">C</span>
          <span className="font-serif italic -ml-1">u</span>
          <span className="font-pixel text-red-400 text-3xl sm:text-5xl font-bold">T</span>
        </div>

        {/* Video Editing Philosophical Questions */}
        <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-400 font-serif italic mt-1">
          <span>is it retention?</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>is it story?</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>or pacing?</span>
        </div>
        <div className="font-serif italic text-zinc-500 text-xs tracking-wider mt-1 select-none">
          "welcome to a web of cuts!"
        </div>
      </div>

      {/* Main Stencil & Illustrated Centerpiece (From Reference 2) */}
      <div className="relative inline-block mt-2">
        {/* The Giant Stencil Text Container */}
        <div className="relative font-black tracking-tighter text-6xl sm:text-8xl lg:text-[130px] leading-[0.88] text-white uppercase text-center flex flex-col items-center">
          {/* Top Row: PORT */}
          <div className="relative flex items-center justify-center">
            <span>P</span>
            
            {/* 'O' with Character Face Peeking Through (From Reference 2) */}
            <div className="relative inline-flex items-center justify-center">
              <span>O</span>
              {/* Illustrated Character with Glasses Peeking Out */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full p-2 pointer-events-none z-10"
                fill="none"
              >
                {/* Hair / Head outline */}
                <path
                  d="M20,65 Q50,20 80,65"
                  stroke="#ffffff"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Eyeglasses Frame */}
                <circle cx="38" cy="55" r="14" stroke="#ffffff" strokeWidth="5" fill="#141518" />
                <circle cx="62" cy="55" r="14" stroke="#ffffff" strokeWidth="5" fill="#141518" />
                <line x1="52" y1="55" x2="48" y2="55" stroke="#ffffff" strokeWidth="5" />
                {/* Eyes Looking Skeptical */}
                <circle cx="39" cy="55" r="4" fill="#ffffff" />
                <circle cx="63" cy="55" r="4" fill="#ffffff" />
                {/* Smirk Nose */}
                <path d="M50,58 Q53,64 48,65" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>

            <span>R</span>
            <span>T</span>
          </div>

          {/* Bottom Row: FOLIO */}
          <div className="relative flex items-center justify-center -mt-2 sm:-mt-4">
            <span>F</span>
            
            {/* Red Circle Accent Graphic (From Reference 2) */}
            <div className="relative inline-flex items-center justify-center">
              <span>O</span>
              <span className="absolute w-8 h-8 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-red-600 shadow-lg pointer-events-none z-0" />
            </div>

            <span>L</span>
            <span>I</span>
            
            {/* 'O' with Second Character Peeking (From Reference 2) */}
            <div className="relative inline-flex items-center justify-center">
              <span>O</span>
              {/* Spiky-hair Character peeking from bottom */}
              <svg
                viewBox="0 0 100 100"
                className="absolute bottom-1 right-0 w-full h-full p-2 pointer-events-none z-10"
                fill="none"
              >
                {/* Spiky Hair */}
                <path
                  d="M25,75 L35,55 L48,68 L60,50 L72,65 L80,55"
                  stroke="#ffffff"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Intense Eyebrows & Eyes */}
                <line x1="38" y1="72" x2="48" y2="76" stroke="#ffffff" strokeWidth="4" />
                <circle cx="43" cy="79" r="3" fill="#ffffff" />
                <line x1="62" y1="76" x2="52" y2="72" stroke="#ffffff" strokeWidth="4" />
                <circle cx="57" cy="79" r="3" fill="#ffffff" />
              </svg>
            </div>
          </div>
        </div>

        {/* Scotch Tape Graphic Overlay */}
        <div className="absolute -top-3 left-1/4 w-16 sm:w-24 h-6 tape-strip rotate-6 pointer-events-none" />
        <div className="absolute -bottom-2 right-1/4 w-14 sm:w-20 h-5 tape-strip -rotate-3 pointer-events-none" />
      </div>
    </div>
  );
};
