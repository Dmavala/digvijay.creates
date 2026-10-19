import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PROJECTS, Project } from '../../data/romanData';

interface InfiniteProjectsListProps {
  isActive: boolean;
  onSelectProject?: (project: Project) => void;
}

export const InfiniteProjectsList: React.FC<InfiniteProjectsListProps> = ({
  isActive,
  onSelectProject,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<HTMLHeadingElement[]>([]);
  const blurFilterRef = useRef<SVGFEGaussianBlurElement>(null);

  const [activeProjectId, setActiveProjectId] = useState<string>('zero-day');

  // Physics and positioning refs
  const currentPosRef = useRef<number>(0);
  const targetPosRef = useRef<number>(0);
  const setHeightRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const currentStretchRef = useRef<number>(1);
  const currentBlurYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startPosRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const dragDistanceRef = useRef<number>(0);

  // Measure single set height
  const measureHeight = useCallback(() => {
    if (setRef.current) {
      const h = setRef.current.offsetHeight;
      if (h > 0) {
        setHeightRef.current = h;
        // If uninitialized or out of bounds, center in the middle set
        if (currentPosRef.current === 0) {
          currentPosRef.current = h;
          targetPosRef.current = h;
        }
      }
    }
  }, []);

  useEffect(() => {
    measureHeight();
    if (document.fonts) {
      document.fonts.ready.then(measureHeight);
    }
    window.addEventListener('resize', measureHeight);
    return () => window.removeEventListener('resize', measureHeight);
  }, [measureHeight]);

  // Main 120fps physics, stretchy render, and directional blur loop
  useEffect(() => {
    if (!isActive) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const setH = setHeightRef.current;

      // 1. Lerp position
      const diff = targetPosRef.current - currentPosRef.current;
      currentPosRef.current += diff * 0.09;
      const velocity = diff * 0.09;

      // 2. Wrap around seamlessly if height is measured
      if (setH > 0) {
        if (currentPosRef.current >= 2 * setH) {
          currentPosRef.current -= setH;
          targetPosRef.current -= setH;
        } else if (currentPosRef.current <= 0) {
          currentPosRef.current += setH;
          targetPosRef.current += setH;
        }
      }

      // 3. Smooth stretchy effect calculation
      // When moving fast, typography stretches along the Y-axis (scaleY: 1.0 -> 1.45)
      const targetStretch = 1 + Math.min(0.45, Math.abs(velocity) * 0.016);
      currentStretchRef.current += (targetStretch - currentStretchRef.current) * 0.14;

      // 4. Directional Motion Blur (strictly along the vertical Y-axis: stdDeviation="0 blurY")
      // 0px at rest, smoothly rising to ~5px at peak scroll velocity
      const targetBlur = Math.min(5.5, Math.abs(velocity) * 0.18);
      currentBlurYRef.current += (targetBlur - currentBlurYRef.current) * 0.16;
      const blurY = currentBlurYRef.current < 0.08 ? 0 : Number(currentBlurYRef.current.toFixed(2));

      if (blurFilterRef.current) {
        blurFilterRef.current.setAttribute('stdDeviation', `0 ${blurY}`);
      }

      // 5. Update track translation & directional blur filter
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(0, ${-currentPosRef.current}px, 0)`;
        trackRef.current.style.filter = blurY > 0 ? 'url(#directional-blur-y)' : 'none';
      }

      // 6. Update stretchy scale on each individual title (centered origin for elegant elastic feel)
      const stretch = currentStretchRef.current;
      titleRefs.current.forEach((el) => {
        if (el) {
          el.style.transformOrigin = '50% 50%';
          el.style.transform = `scaleY(${stretch})`;
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    // Ensure measurement on mount
    measureHeight();
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, measureHeight]);

  // Wheel Scroll Handler: adds to targetPos with momentum
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Scale wheel delta for smooth, responsive scrolling
    const delta = e.deltaY;
    targetPosRef.current += delta * 0.85;
  };

  // Pointer / Drag Handlers (supports both mouse drag and touch gestures)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    startYRef.current = e.clientY;
    startPosRef.current = targetPosRef.current;
    lastYRef.current = e.clientY;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const currentY = e.clientY;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const dy = currentY - lastYRef.current;

    dragDistanceRef.current += Math.abs(dy);
    targetPosRef.current -= dy;

    // Track pointer velocity for momentum throw
    velocityRef.current = dy / dt;
    lastYRef.current = currentY;
    lastTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // Apply momentum throw based on release velocity
    if (Math.abs(velocityRef.current) > 0.1) {
      targetPosRef.current -= velocityRef.current * 180;
    }
  };

  const handleProjectClick = (project: Project, e: React.MouseEvent) => {
    // If the user was dragging, prevent accidental link click
    if (dragDistanceRef.current > 8) {
      e.preventDefault();
      return;
    }
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="infinite-projects-container relative z-10 w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing pl-8 md:pl-20 pr-4 md:pr-10"
      style={{ touchAction: 'none' }}
    >
      {/* SVG Directional Blur Filter (Strictly Vertical Motion Blur along Y-axis) */}
      <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="directional-blur-y" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur ref={blurFilterRef} in="SourceGraphic" stdDeviation="0 0" />
          </filter>
        </defs>
      </svg>

      {/* Moving Track with hardware acceleration */}
      <div
        ref={trackRef}
        className="infinite-projects-track will-change-transform flex flex-col pt-12 pb-24"
      >
        {/* Set 0 (Clone for wrap) */}
        <div className="project-set flex flex-col space-y-4 md:space-y-6">
          {PROJECTS.map((project, idx) => {
            const isRed = activeProjectId === project.id;
            return (
              <a
                key={`set0-${project.id}-${idx}`}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleProjectClick(project, e)}
                onMouseEnter={() => setActiveProjectId(project.id)}
                className="block group text-decoration-none will-change-transform"
              >
                <h2
                  ref={(el) => {
                    if (el) titleRefs.current[idx] = el;
                  }}
                  className={`font-anton text-[clamp(4.5rem,8.5vw,10.5rem)] leading-[0.88] tracking-tight uppercase whitespace-nowrap transition-colors duration-150 origin-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] ${
                    isRed ? 'text-[#ff0000]' : 'text-white group-hover:text-[#ff0000]'
                  }`}
                >
                  {project.client.toUpperCase()}
                </h2>
              </a>
            );
          })}
        </div>

        {/* Set 1 (Primary Set - measured for height) */}
        <div ref={setRef} className="project-set flex flex-col space-y-4 md:space-y-6 mt-4 md:mt-6">
          {PROJECTS.map((project, idx) => {
            const isRed = activeProjectId === project.id;
            const refIdx = PROJECTS.length + idx;
            return (
              <a
                key={`set1-${project.id}-${idx}`}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleProjectClick(project, e)}
                onMouseEnter={() => setActiveProjectId(project.id)}
                className="block group text-decoration-none will-change-transform"
              >
                <h2
                  ref={(el) => {
                    if (el) titleRefs.current[refIdx] = el;
                  }}
                  className={`font-anton text-[clamp(4.5rem,8.5vw,10.5rem)] leading-[0.88] tracking-tight uppercase whitespace-nowrap transition-colors duration-150 origin-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] ${
                    isRed ? 'text-[#ff0000]' : 'text-white group-hover:text-[#ff0000]'
                  }`}
                >
                  {project.client.toUpperCase()}
                </h2>
              </a>
            );
          })}
        </div>

        {/* Set 2 (Clone for wrap) */}
        <div className="project-set flex flex-col space-y-4 md:space-y-6 mt-4 md:mt-6">
          {PROJECTS.map((project, idx) => {
            const isRed = activeProjectId === project.id;
            const refIdx = PROJECTS.length * 2 + idx;
            return (
              <a
                key={`set2-${project.id}-${idx}`}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleProjectClick(project, e)}
                onMouseEnter={() => setActiveProjectId(project.id)}
                className="block group text-decoration-none will-change-transform"
              >
                <h2
                  ref={(el) => {
                    if (el) titleRefs.current[refIdx] = el;
                  }}
                  className={`font-anton text-[clamp(4.5rem,8.5vw,10.5rem)] leading-[0.88] tracking-tight uppercase whitespace-nowrap transition-colors duration-150 origin-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] ${
                    isRed ? 'text-[#ff0000]' : 'text-white group-hover:text-[#ff0000]'
                  }`}
                >
                  {project.client.toUpperCase()}
                </h2>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
