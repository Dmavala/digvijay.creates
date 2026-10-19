import React from 'react';
import { HeroCenterpiece } from './HeroCenterpiece';
import { RealNotebookNote } from './RealNotebookNote';
import { RedStringLayer } from './RedStringLayer';
import { ArrowDownRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const handleExplore = () => {
    const el = document.getElementById('work');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 overflow-hidden">
      {/* Red Thread Detective Connections */}
      <RedStringLayer />

      {/* Main Composition Board */}
      <div className="relative flex-1 flex flex-col items-center justify-center w-full">
        {/* --- Top Left Real Notebook Note (Yellow Legal/Notebook Style) --- */}
        <div className="absolute top-4 left-2 sm:left-6 md:left-10 lg:left-14 z-20 hidden sm:block">
          <RealNotebookNote
            id="note-comm"
            paperColor="yellow"
            title="Post-Production"
            subtitle="Retention-first editing"
            details={[
              'High-Retention Hooks & Pacing',
              'Cinematic Color Grading (Resolve)',
              'Sound Design & 3D Motion VFX',
            ]}
            rotation="-rotate-3"
            tapeColor="kraft"
            hasPin={true}
            pinColor="red"
            pinPos="top-left"
            className="w-56 sm:w-64"
          />
        </div>

        {/* --- Top Right Real Notebook Note (From Reference Image 2) --- */}
        <div className="absolute top-2 right-2 sm:right-6 md:right-10 lg:right-14 z-20 hidden sm:block">
          <RealNotebookNote
            id="note-author"
            paperColor="cream"
            title="digvijay.creates"
            subtitle="Boutique Studio • 2026"
            statusBadge="Taking 2 New Clients"
            rotation="rotate-2"
            tapeColor="kraft"
            hasPin={true}
            pinColor="red"
            pinPos="top-center"
            className="w-56 sm:w-64"
          >
            <div className="mt-1 font-handwriting text-xs text-zinc-600">
              Direct with lead editor. No junior hand-offs.
            </div>
          </RealNotebookNote>
        </div>

        {/* --- Centerpiece Stencil Typography & Peek-Throughs --- */}
        <div className="relative z-10 w-full flex flex-col items-center">
          <HeroCenterpiece />

          {/* Central Red Pin on the Stencil Title for Thread Connection */}
          <div 
            id="pin-center" 
            className="hidden md:block absolute top-[138px] left-[39.5%] w-4 h-4 rounded-full pin-head-red z-30 pointer-events-none"
          >
            <div className="absolute top-2 left-1.5 w-2 h-3 bg-black/50 blur-[1px] -rotate-45" />
          </div>
        </div>

        {/* --- Bottom Left Real Notebook Note (Blue Grid/Lined Style) --- */}
        <div className="absolute bottom-6 left-2 sm:left-6 md:left-10 lg:left-14 z-20 hidden md:block">
          <RealNotebookNote
            id="note-print"
            paperColor="blue"
            title="Formats & Delivery"
            subtitle="Built to captivate & convert"
            details={[
              'YouTube Long-form (15-45m)',
              'Shorts, Reels & TikTok (9:16)',
              'Commercials & Brand Films',
            ]}
            rotation="rotate-2"
            tapeColor="scotch"
            hasPin={true}
            pinColor="blue"
            pinPos="top-right"
            className="w-56 sm:w-64"
          />
        </div>

        {/* --- Bottom Right Tactile Action Card (Replaces Win95 Modal) --- */}
        <div className="relative sm:absolute sm:bottom-8 md:bottom-12 sm:right-4 md:right-8 lg:right-14 z-30 mt-8 sm:mt-0">
          <div className="relative w-72 sm:w-80 bg-[#fbf8f1] border border-[#e8e2d2] p-5 rounded-[2px] shadow-[0_8px_25px_rgba(0,0,0,0.55)] -rotate-1 hover:rotate-0 transition-transform duration-200">
            {/* Curled Bottom Shadow */}
            <div className="absolute -bottom-1.5 right-2 w-3/4 h-6 bg-black/45 blur-md rounded-full pointer-events-none transform rotate-2" />

            {/* Kraft Tape at Top */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div 
                className="w-20 h-6 bg-[#c68e3f]/85 border-t border-b border-[#dfab5c]/40 shadow-sm"
                style={{
                  clipPath: 'polygon(0% 4%, 3% 0%, 97% 2%, 100% 6%, 98% 95%, 95% 100%, 3% 97%, 0% 92%)',
                }}
              />
            </div>

            {/* 3D Push Pin */}
            <div className="absolute -top-2.5 left-3 z-40 w-4 h-4 rounded-full pin-head-red pointer-events-none">
              <div className="absolute top-2 left-1.5 w-2 h-3.5 bg-black/50 blur-[1px] -rotate-45" />
            </div>

            <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
              DIRECTOR'S CUT
            </div>
            <h5 className="font-handwriting font-bold text-2xl text-zinc-900 leading-tight mb-1">
              Ready to elevate your edits?
            </h5>
            <p className="font-handwriting text-sm text-zinc-700 leading-snug mb-4">
              Transforming raw footage into high-retention, viral visual masterworks.
            </p>

            <div className="flex items-center gap-2 pt-3 border-t border-dashed border-zinc-300">
              <button
                onClick={handleExplore}
                className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-[2px] font-mono text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span>Watch Reel ▶</span>
              </button>
              <a
                href="#contact"
                className="flex-1 py-2 px-3 bg-[#f0ebd9] hover:bg-[#e4dcbe] text-zinc-900 border border-[#d8cfb7] rounded-[2px] font-mono text-xs font-semibold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <span>Book a Call ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* --- Hand-drawn Sketch Annotations & Arrows (From Reference 2) --- */}
        {/* Annotation 1: Bottom-Left Arrow pointing to Retention Editing */}
        <div className="hidden lg:block absolute bottom-20 left-[32%] text-left font-handwriting text-zinc-400 select-none pointer-events-none -rotate-2">
          <div className="text-2xl font-bold text-zinc-300">Retention Editing</div>
          <div className="text-sm text-zinc-400 max-w-[190px] leading-tight">
            Avg. 72% view duration, 100M+ views generated.
          </div>
        </div>

        {/* Annotation 2: Bottom Center-Right "About Agency" */}
        <div className="hidden lg:flex items-center gap-2 absolute bottom-8 left-[45%] font-handwriting text-zinc-400 select-none pointer-events-none rotate-2">
          <div className="text-right">
            <div className="text-lg font-bold text-zinc-300">About the agency</div>
            <div className="text-xs text-zinc-500">4+ years editing for top creators</div>
          </div>
          <ArrowDownRight className="w-5 h-5 text-zinc-500" />
        </div>
      </div>

      {/* Bottom Sticky Tape Credit Bar */}
      <div className="relative z-20 pt-6 mt-8 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-red-500" />
          <span>DIGVIJAY.CREATES // BOUTIQUE POST-PRODUCTION STUDIO</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span className="hover:text-white transition-colors cursor-default">[ PREMIERE PRO ]</span>
          <span className="hover:text-white transition-colors cursor-default">[ AFTER EFFECTS ]</span>
          <span className="hover:text-white transition-colors cursor-default">[ DAVINCI RESOLVE ]</span>
          <span className="hover:text-white transition-colors cursor-default">[ BLENDER ]</span>
        </div>
      </div>
    </section>
  );
};
