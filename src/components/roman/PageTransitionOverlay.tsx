import React, { useEffect, useState, useRef } from 'react';
import { SectionType } from '../../App';

interface PageTransitionOverlayProps {
  isTransitioning: boolean;
  fromSection: SectionType;
  toSection: SectionType;
  prefersReducedMotion?: boolean;
  onTransitionComplete: () => void;
}

const SECTION_TITLES: Record<SectionType, string> = {
  home: 'DIGVIJAY',
  projects: 'WORK',
  about: 'WHO',
  contact: 'MEET ME',
};

const getTitleClass = (section: SectionType) => {
  if (section === 'about') {
    return 'text-[clamp(6rem,16vw,20rem)] leading-[0.80] tracking-tighter';
  }
  return 'text-[clamp(5rem,13vw,14rem)] leading-[0.85] tracking-tight';
};

const GLITCH_LINES = [
  { top: '6%', left: '-10%', width: '120%', height: '3px', opacity: 1, delay: 0 },
  { top: '14%', left: '5%', width: '85%', height: '1px', opacity: 0.85, delay: 30 },
  { top: '22%', left: '-5%', width: '110%', height: '5px', opacity: 1, delay: 15 },
  { top: '33%', left: '15%', width: '70%', height: '2px', opacity: 0.9, delay: 45 },
  { top: '45%', left: '-15%', width: '130%', height: '8px', opacity: 1, delay: 10 },
  { top: '56%', left: '0%', width: '100%', height: '2px', opacity: 0.8, delay: 50 },
  { top: '67%', left: '-8%', width: '115%', height: '4px', opacity: 0.95, delay: 20 },
  { top: '78%', left: '10%', width: '80%', height: '2px', opacity: 0.85, delay: 35 },
  { top: '86%', left: '-12%', width: '125%', height: '6px', opacity: 1, delay: 5 },
  { top: '93%', left: '5%', width: '90%', height: '3px', opacity: 0.9, delay: 40 },
];

export const PageTransitionOverlay: React.FC<PageTransitionOverlayProps> = ({
  isTransitioning,
  fromSection: _fromSection,
  toSection,
  prefersReducedMotion = false,
  onTransitionComplete,
}) => {
  const [phase, setPhase] = useState<'idle' | 'enter' | 'hold' | 'reveal'>('idle');
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    if (!isTransitioning) {
      setPhase('idle');
      clearTimers();
      return;
    }

    clearTimers();
    setPhase('enter');

    // Reduced motion swaps the strobe/glitch for a short, plain cut. The
    // timings still clear `wheelLock` downstream, so they stay proportional.
    const holdAt = prefersReducedMotion ? 60 : 150;
    const revealAt = prefersReducedMotion ? 80 : 190;
    const doneAt = prefersReducedMotion ? 160 : 350;

    // Phase 2: Aperture settles at center; hold steady while section switches at 160ms
    const t1 = window.setTimeout(() => {
      setPhase('hold');
    }, holdAt);
    timersRef.current.push(t1);

    // Phase 3: Morph solid red aperture into destination typography, backdrop fades out
    const t2 = window.setTimeout(() => {
      setPhase('reveal');
    }, revealAt);
    timersRef.current.push(t2);

    // Phase 4: Transition complete, restore normal pointer events
    const t3 = window.setTimeout(() => {
      onTransitionComplete();
    }, doneAt);
    timersRef.current.push(t3);

    return () => clearTimers();
  }, [isTransitioning, onTransitionComplete, prefersReducedMotion]);

  if (!isTransitioning && phase === 'idle') return null;

  // Reduced motion: no strobe, no glitch slices, no scaling aperture — just a
  // short black cut carrying the destination wordmark.
  if (prefersReducedMotion) {
    return (
      <div
        className="fixed inset-0 w-screen h-screen pointer-events-none z-50 overflow-hidden flex items-center justify-center bg-black"
        aria-hidden="true"
      >
        <span
          className="font-anton text-[#ff0000] uppercase px-6 py-2 select-none"
          style={{
            fontSize: 'clamp(3rem, 13vw, 14rem)',
            lineHeight: 0.85,
          }}
        >
          {SECTION_TITLES[toSection] || 'DIGVIJAY'}
        </span>
      </div>
    );
  }

  const targetTitle = SECTION_TITLES[toSection] || 'DIGVIJAY';
  const titleTypography = getTitleClass(toSection);

  // Backdrop opacity: solid black (#000000) during enter and hold, fades out in reveal phase
  const backdropOpacity = phase === 'idle' ? 0 : phase === 'reveal' ? 0 : 1;

  // Aperture scale: starts at 1.5 and snaps quickly into 1.0 (center)
  const apertureScale = phase === 'idle' ? 1.5 : phase === 'enter' ? 1.0 : 1.0;
  const apertureTransition =
    phase === 'enter'
      ? 'transform 140ms cubic-bezier(0.16, 1, 0.3, 1)'
      : 'none';

  return (
    <div
      className="fixed inset-0 w-screen h-screen pointer-events-none z-50 overflow-hidden flex items-center justify-center"
      aria-hidden="true"
    >
      {/* 1. Red Glitch Lines & Laser Slices (Z-50: Slices through the flash and backdrop) */}
      <div
        key={`glitch-${toSection}`}
        className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
      >
        {/* Fine Red CRT Scanlines with Strobe Flicker */}
        <div
          className="glitch-scanlines absolute inset-0 mix-blend-screen"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255, 0, 0, 0.5) 4px, rgba(255, 0, 0, 0.5) 5px)',
          }}
        />

        {/* Dynamic Horizontal Red Laser Glitch Strips */}
        {GLITCH_LINES.map((line, i) => (
          <div
            key={i}
            className={`${i % 2 === 0 ? 'glitch-laser-1' : 'glitch-laser-2'} absolute bg-[#ff0000]`}
            style={{
              top: line.top,
              left: line.left,
              width: line.width,
              height: line.height,
              opacity: line.opacity,
              boxShadow: '0 0 16px #ff0000, 0 0 4px #ffffff',
              animationDelay: `${line.delay}ms`,
            }}
          />
        ))}
      </div>

      {/* 2. Pure Xenon White Core Flash (Instant high-speed 110ms strobe) */}
      <div
        key={`flash-white-${toSection}`}
        className="transition-flash-white absolute inset-0 pointer-events-none z-40 bg-white"
      />

      {/* 3. Crimson Atmospheric Bloom Flash (220ms ambient dissipation) */}
      <div
        key={`flash-red-${toSection}`}
        className="transition-flash-red absolute inset-0 pointer-events-none z-30"
        style={{
          background:
            'radial-gradient(circle at center, #ffffff 15%, rgba(255, 30, 30, 0.95) 45%, #ff0000 75%, #aa0000 100%)',
        }}
      />

      {/* 4. Pitch-Black Fullscreen Backdrop with smooth fade-out */}
      <div
        className="absolute inset-0 bg-[#000000] z-10"
        style={{
          opacity: backdropOpacity,
          transition: phase === 'reveal' ? 'opacity 160ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
      />

      {/* Central Red Aperture / Typographic Morph Container */}
      <div
        className="relative z-20 flex items-center justify-center select-none"
        style={{
          transform: `scale(${apertureScale})`,
          transition: apertureTransition,
          willChange: 'transform, opacity',
        }}
      >
        {/* Atmospheric Red Halo Glow */}
        <div
          className="absolute -inset-16 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.6)_0%,rgba(200,0,0,0.22)_50%,transparent_75%)] blur-2xl pointer-events-none transition-opacity duration-200"
          style={{ opacity: phase === 'reveal' ? 0 : 1 }}
        />

        {/* Phase A: Solid Red Aperture Card (exact bounding shape of destination title) */}
        <div
          className="relative flex items-center justify-center"
          style={{
            opacity: phase === 'reveal' ? 0 : 1,
            transition: phase === 'reveal' ? 'opacity 110ms ease-out' : 'none',
          }}
        >
          {/* Solid Red Block */}
          <div className="absolute inset-0 bg-[#ff0000] shadow-[0_0_50px_rgba(255,0,0,0.6)]" />

          {/* Invisible text ensuring exact bounding dimensions */}
          <span
            className={`font-anton ${titleTypography} uppercase opacity-0 px-6 py-2`}
          >
            {targetTitle}
          </span>
        </div>

        {/* Phase B: Revealed Solid Red Typographic Wordmark */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: phase === 'reveal' ? 1 : 0,
            transition: phase === 'reveal' ? 'opacity 130ms ease-in' : 'none',
          }}
        >
          <span
            className={`font-anton text-[#ff0000] ${titleTypography} uppercase px-6 py-2 drop-shadow-[0_0_30px_rgba(255,0,0,0.6)]`}
          >
            {targetTitle}
          </span>
        </div>
      </div>
    </div>
  );
};
