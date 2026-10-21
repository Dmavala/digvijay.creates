import React, { useRef, useEffect } from 'react';
import { ASCII_PORTRAIT } from '../../data/asciiPortrait';

interface AboutSectionProps {
  isActive: boolean;
}

const GLYPHS = '01{}<>/;=+*#$%&';

export const AboutSection: React.FC<AboutSectionProps> = ({ isActive }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLPreElement | null>(null);
  const liveRef = useRef<HTMLPreElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Guarantee the about section always loads at the top, never scrolled
  useEffect(() => {
    if (isActive) {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      const resetScroll = () => {
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
      };
      requestAnimationFrame(resetScroll);
      const t1 = setTimeout(resetScroll, 50);
      const t2 = setTimeout(resetScroll, 160);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isActive]);

  useEffect(() => {
    const box = boxRef.current;
    const ghost = ghostRef.current;
    const live = liveRef.current;
    if (!box || !ghost || !live) return;

    box.classList.add('is-live');

    // Cancel any active animation frame
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (!isActive) {
      live.textContent = '';
      return;
    }

    // Respect reduced motion: immediately display full portrait with no animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      live.textContent = ASCII_PORTRAIT;
      return;
    }

    const lines = ASCII_PORTRAIT.split('\n');
    const numLines = lines.length;
    let maxCols = 0;
    for (let i = 0; i < numLines; i++) {
      if (lines[i].length > maxCols) maxCols = lines[i].length;
    }

    // Precompute character matrix for ultra-fast frame synthesis
    const targetMatrix: string[][] = lines.map((line) => {
      const arr = new Array(maxCols);
      for (let c = 0; c < maxCols; c++) {
        arr[c] = c < line.length ? line[c] : ' ';
      }
      return arr;
    });

    // Generate falling parameters per column
    interface ColDrop {
      delay: number;
      speed: number;
      trailLen: number;
    }
    const colDrops: ColDrop[] = [];
    for (let c = 0; c < maxCols; c++) {
      // Subtle center-weighted ripple delay (0 to ~400ms) with organic jitter
      const centerDist = Math.abs(c - maxCols / 2) / (maxCols / 2);
      const delay = centerDist * 160 + Math.random() * 260;
      // Falling speed: 56 to 86 rows per second
      const speed = 56 + Math.random() * 30;
      // Trail length: 7 to 15 characters
      const trailLen = 7 + Math.floor(Math.random() * 9);
      colDrops.push({ delay, speed, trailLen });
    }

    const startTime = performance.now();
    // Reusable character grid and line buffer to ensure zero-allocation 60 FPS
    const grid: string[][] = Array.from({ length: numLines }, () => new Array(maxCols).fill(' '));
    const outLines: string[] = new Array(numLines);

    let isDone = false;

    const frame = (now: number) => {
      const elapsedTotal = now - startTime;
      let allColsCompleted = true;

      for (let c = 0; c < maxCols; c++) {
        const { delay, speed, trailLen } = colDrops[c];
        const elapsed = elapsedTotal - delay;

        if (elapsed < 0) {
          allColsCompleted = false;
          for (let r = 0; r < numLines; r++) {
            grid[r][c] = ' ';
          }
          continue;
        }

        const headY = (elapsed / 1000) * speed;
        const headInt = Math.floor(headY);
        const trailStart = Math.floor(headY - trailLen);

        if (trailStart < numLines) {
          allColsCompleted = false;
        }

        for (let r = 0; r < numLines; r++) {
          if (r > headInt) {
            grid[r][c] = ' ';
          } else if (r >= trailStart) {
            grid[r][c] = GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
          } else if (r >= trailStart - 2 && targetMatrix[r][c] !== ' ') {
            // Resolving settling shimmer
            grid[r][c] =
              Math.random() > 0.35
                ? targetMatrix[r][c]
                : GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
          } else {
            grid[r][c] = targetMatrix[r][c];
          }
        }
      }

      if (allColsCompleted) {
        live.textContent = ASCII_PORTRAIT;
        isDone = true;
        return;
      }

      for (let r = 0; r < numLines; r++) {
        outLines[r] = grid[r].join('').trimEnd();
      }
      live.textContent = outLines.join('\n');

      if (!isDone) {
        animFrameRef.current = requestAnimationFrame(frame);
      }
    };

    animFrameRef.current = requestAnimationFrame(frame);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isActive]);

  return (
    <div
      className={`section page__about !p-0 w-full h-full relative select-none bg-black text-white ${
        isActive ? 'active about-active' : ''
      }`}
      id="about"
    >
      <div
        ref={containerRef}
        className="about-scroll-container w-full h-full !overflow-y-auto !overflow-x-hidden relative"
      >
        <div className="w-full min-h-full flex flex-col lg:flex-row items-start justify-between relative px-4 sm:px-8 lg:px-12 py-12 lg:py-0">
          {/* ================= LEFT SIDE: CINEMATIC BLUR TEXT TRANSITIONS ================= */}
          <div className="flex-1 w-full lg:w-[44%] pl-4 sm:pl-8 md:pl-10 lg:pl-12 pr-4 sm:pr-6 py-8 lg:py-12 flex flex-col justify-center z-10">
            <div className="flex flex-col gap-8 max-w-xl">
              {/* 1. Monumental Name Wordmark */}
              <div className="cinematic-blur-item cinematic-blur-1">
                <h2 className="font-anton text-[4.5rem] sm:text-[6.5rem] md:text-[7.5rem] lg:text-[8.5rem] xl:text-[9.5rem] 2xl:text-[10.5rem] tracking-tight leading-[0.88] text-white uppercase select-none">
                  DIGVIJAY
                  <br />
                  <span className="text-[#ff0000]">KOHINKAR</span>
                </h2>
              </div>

              {/* 2. Defining Statement */}
              <p className="cinematic-blur-item cinematic-blur-2 text-neutral-200 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-xl font-normal border-l-4 border-[#ff0000] pl-6 py-1.5">
                I cut stories that hit. Every frame earns its place, every cut has a reason, and the sound carries half the story. I turn raw footage into something you feel before you understand it.
              </p>

              {/* 3, 4, 5. The 3 Core Disciplines */}
              <div className="flex flex-col gap-6 mt-1">
                <div className="cinematic-blur-item cinematic-blur-3 border-l-[3px] border-[#ff0000] pl-6 py-3 bg-neutral-950/60 rounded-r-md">
                  <h3 className="font-anton text-lg sm:text-xl md:text-2xl text-white tracking-wide uppercase">
                    01 / CINEMATIC EDITORIAL & RHYTHM
                  </h3>
                  <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mt-1.5">
                    Shaping pacing, tension, and narrative flow so every cut lands exactly on the beat, from raw footage to a story that holds attention to the last frame.
                  </p>
                </div>

                <div className="cinematic-blur-item cinematic-blur-4 border-l-[3px] border-[#ff0000] pl-6 py-3 bg-neutral-950/60 rounded-r-md">
                  <h3 className="font-anton text-lg sm:text-xl md:text-2xl text-white tracking-wide uppercase">
                    02 / COLOR & ATMOSPHERE
                  </h3>
                  <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mt-1.5">
                    Film-grade color grading that gives each project its own mood and identity, built in DaVinci Resolve.
                  </p>
                </div>

                <div className="cinematic-blur-item cinematic-blur-5 border-l-[3px] border-[#ff0000] pl-6 py-3 bg-neutral-950/60 rounded-r-md">
                  <h3 className="font-anton text-lg sm:text-xl md:text-2xl text-white tracking-wide uppercase">
                    03 / SOUND DESIGN & MOTION
                  </h3>
                  <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mt-1.5">
                    Layered multi-track audio, impact hits, and ambience, paired with After Effects motion graphics that make every edit feel polished and alive.
                  </p>
                </div>
              </div>

              {/* 6. Arsenal & Tools Badges */}
              <div className="cinematic-blur-item cinematic-blur-6 mt-1">
                <div className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-neutral-400 mb-3">
                  CORE ARSENAL &bull; STACK
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    'DaVinci Resolve',
                    'Premiere Pro',
                    'After Effects',
                    'Color Grading',
                    'Sound Design',
                    'Motion Graphics',
                    'Storytelling',
                  ].map((tool) => (
                    <span
                      key={tool}
                      className="px-3.5 py-1.5 text-xs sm:text-sm font-mono tracking-wider text-neutral-200 bg-neutral-900 border border-neutral-800 rounded-sm hover:border-[#ff0000] hover:text-white transition-colors"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE: FALLING CIPHER MATRIX & ASCII PORTRAIT ================= */}
          <div className="flex-1 w-full lg:w-[56%] px-0 flex items-center justify-center lg:justify-end z-10 pointer-events-none select-none my-6 lg:my-0 lg:sticky lg:top-0 lg:h-screen lg:pr-8 xl:pr-14">
            <section className="ascii-about w-full flex flex-col items-center justify-center" aria-label="About me portrait">
              <div className="ascii-frame">
                <div
                  ref={boxRef}
                  className="ascii-art"
                  role="img"
                  aria-label="ASCII art portrait of Digvijay Kohinkar"
                >
                  <pre ref={ghostRef} className="ascii-ghost" aria-hidden="true">
                    {ASCII_PORTRAIT}
                  </pre>
                  <pre ref={liveRef} className="ascii-live" aria-hidden="true" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Scoped CSS Styles for Falling Matrix Code & Cinematic Blur Transitions */}
      <style>{`
        /* Cinematic Optical Blur Rack-Focus Stagger */
        .cinematic-blur-item {
          opacity: 0;
          filter: blur(22px);
          transform: translateY(20px) scale(0.98);
          will-change: filter, opacity, transform;
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                      filter 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .about-active .cinematic-blur-item {
          opacity: 1;
          filter: blur(0px);
          transform: translateY(0) scale(1);
        }
        .about-active .cinematic-blur-1 { transition-delay: 100ms; }
        .about-active .cinematic-blur-2 { transition-delay: 280ms; }
        .about-active .cinematic-blur-3 { transition-delay: 460ms; }
        .about-active .cinematic-blur-4 { transition-delay: 640ms; }
        .about-active .cinematic-blur-5 { transition-delay: 820ms; }
        .about-active .cinematic-blur-6 { transition-delay: 1000ms; }

        @media (prefers-reduced-motion: reduce) {
          .cinematic-blur-item {
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
            transition: none !important;
          }
        }

        /* ASCII Art Matrix Structure */
        .ascii-about {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          background: transparent;
        }
        .ascii-frame {
          width: auto;
          max-width: 100%;
          background: transparent;
          border: none;
          box-shadow: none;
          overflow: visible;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .ascii-art {
          position: relative;
          color: #ff0000;
          background: transparent;
          border: none;
          outline: none;
          box-shadow: none;
          overflow: visible;
        }
        .ascii-art pre {
          margin: 0;
          padding: 0;
          font-family: "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace;
          font-size: clamp(4.2px, 0.44vw, 6.4px);
          line-height: 1.12;
          white-space: pre;
          letter-spacing: 0px;
        }
        /* Ghost placeholder maintains exact geometry invisibly while rain falls */
        .ascii-ghost {
          visibility: hidden;
          opacity: 0;
          color: transparent;
          user-select: none;
          pointer-events: none;
        }
        /* Live falling code cascade and sculpted portrait */
        .ascii-live {
          position: absolute;
          top: 0;
          left: 0;
          color: #ff0000;
          text-shadow: 0 0 10px rgba(255, 0, 0, 0.85), 0 0 25px rgba(255, 0, 0, 0.45);
          user-select: none;
        }
        @media (max-width: 1024px) {
          .ascii-art pre {
            font-size: clamp(2.8px, 0.85vw, 4.8px);
          }
        }
      `}</style>
    </div>
  );
};
