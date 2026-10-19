import React, { useEffect, useRef, useCallback } from 'react';
import { HERO_CLIPS } from '../../data/heroClips';
import Auralis from '../ui/auralis';

interface TheatreScreenCanvasProps {
  isActive: boolean;
  isMuted?: boolean;
  activeClipIndex?: number;
  onClipChange?: (index: number) => void;
  onNavigateNext?: () => void;
}

export const TheatreScreenCanvas: React.FC<TheatreScreenCanvasProps> = ({
  isActive,
  isMuted = true,
  activeClipIndex = 0,
  onClipChange,
  onNavigateNext,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardBadgeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const animFrameRef = useRef<number>(0);

  // Audio mute & section active refs for real-time physics and event synchronization
  const isMutedRef = useRef(isMuted);
  const isActiveRef = useRef(isActive);

  // 3D Horizontal Scroll & Physics State
  const scrollPosRef = useRef(activeClipIndex);
  const targetScrollPosRef = useRef(activeClipIndex);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const lastDragXRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const currentActiveIndexRef = useRef(activeClipIndex);
  const overscrollRef = useRef(0);
  const wheelTimeoutRef = useRef<any>(null);

  // Synchronize audio tracks: only the active/centered clip plays audio when unmuted
  const syncAudioPlayback = useCallback((activeIdx: number) => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      const shouldMute = isMutedRef.current || !isActiveRef.current || idx !== activeIdx;
      if (video.muted !== shouldMute) {
        video.muted = shouldMute;
      }
      if (!shouldMute) {
        video.volume = 1.0;
        if (video.paused) {
          video.play().catch(() => {});
        }
      }
    });
  }, []);

  // Update refs and sync audio when isMuted or isActive changes
  useEffect(() => {
    isMutedRef.current = isMuted;
    isActiveRef.current = isActive;
    syncAudioPlayback(currentActiveIndexRef.current);
  }, [isMuted, isActive, syncAudioPlayback]);

  // Sync with external activeClipIndex
  useEffect(() => {
    if (activeClipIndex !== undefined && !isDraggingRef.current) {
      targetScrollPosRef.current = activeClipIndex;
      currentActiveIndexRef.current = activeClipIndex;
      syncAudioPlayback(activeClipIndex);
    }
  }, [activeClipIndex, syncAudioPlayback]);

  // Buffer window: only the centred clip and the neighbours it can visibly lay over
  // are fetched up front. Previously every clip used preload="auto" + autoPlay, so the
  // deck pulled all seven files (~180 MB, one of them a 91 MB reel) before the visitor
  // touched anything. Clips further out stay untouched until the deck scrolls to them.
  const bufferWindow = 2;

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      video.muted = isMutedRef.current || !isActiveRef.current || idx !== currentActiveIndexRef.current;
      video.playsInline = true;
      video.loop = true;

      const inWindow = Math.abs(idx - activeClipIndex) <= bufferWindow;
      if (inWindow && isActiveRef.current) {
        if (video.paused) video.play().catch(() => {});
      } else if (!video.paused) {
        // Paused offscreen clips keep their decoded frame without burning a decoder.
        video.pause();
      }
    });
  }, [activeClipIndex, isMuted, isActive]);

  // Pointer / Mouse Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = scrollPosRef.current;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = performance.now();
    velocityRef.current = 0;
    overscrollRef.current = 0;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastDragTimeRef.current);
    const dx = e.clientX - lastDragXRef.current;
    const instantVel = -dx / dt;
    velocityRef.current += (instantVel - velocityRef.current) * 0.45;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = now;

    const containerWidth = containerRef.current?.clientWidth || 800;
    const dragDelta = (dragStartXRef.current - e.clientX) / (containerWidth * 0.65);
    const newPos = dragStartScrollRef.current + dragDelta;

    // Soft clamp with slight resistance
    if (newPos < 0) {
      targetScrollPosRef.current = newPos * 0.25;
    } else if (newPos > HERO_CLIPS.length - 1) {
      const over = newPos - (HERO_CLIPS.length - 1);
      targetScrollPosRef.current = HERO_CLIPS.length - 1 + over * 0.25;
      overscrollRef.current += Math.abs(dx);
    } else {
      targetScrollPosRef.current = newPos;
      overscrollRef.current = 0;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // Check if interaction was a click/tap on a card rather than an intentional drag
    const dragDistance = Math.abs(e.clientX - dragStartXRef.current);
    if (dragDistance < 12) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const cardEl = target?.closest('[data-clip-index]');
      if (cardEl) {
        const clickedIdx = parseInt(cardEl.getAttribute('data-clip-index') || '', 10);
        if (!isNaN(clickedIdx) && clickedIdx >= 0 && clickedIdx < HERO_CLIPS.length) {
          targetScrollPosRef.current = clickedIdx;
          currentActiveIndexRef.current = clickedIdx;
          if (onClipChange) onClipChange(clickedIdx);
          syncAudioPlayback(clickedIdx);
          return;
        }
      }
    }

    // Check if dragging past the end should navigate to the next section
    if (
      scrollPosRef.current >= HERO_CLIPS.length - 1 &&
      overscrollRef.current > 120 &&
      onNavigateNext
    ) {
      onNavigateNext();
      return;
    }

    // Apply momentum and snap to nearest clip
    const projected = targetScrollPosRef.current + velocityRef.current * 6.0;
    const nearest = Math.round(projected);
    const clamped = Math.max(0, Math.min(HERO_CLIPS.length - 1, nearest));
    targetScrollPosRef.current = clamped;

    if (clamped !== currentActiveIndexRef.current) {
      currentActiveIndexRef.current = clamped;
      if (onClipChange) onClipChange(clamped);
      syncAudioPlayback(clamped);
    }
  };

  // Wheel Scroll: translates horizontal deltaX into 3D horizontal scroll; allows vertical deltaY to bubble to App.tsx for section navigation
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!isActive) return;

      // Only capture predominantly horizontal scrolling for scrubbing the 3D deck
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (Math.abs(e.deltaX) < 3) return;
        e.preventDefault();

        // Check for overscroll at the end of the deck
        if (scrollPosRef.current >= HERO_CLIPS.length - 1 && e.deltaX > 0) {
          overscrollRef.current += e.deltaX;
          if (overscrollRef.current > 180 && onNavigateNext) {
            overscrollRef.current = 0;
            onNavigateNext();
            return;
          }
        } else {
          overscrollRef.current = 0;
        }

        // Smooth impulse accumulator (calibrated: responsive yet deliberate)
        const sensitivity = 0.0030;
        const newPos = targetScrollPosRef.current + e.deltaX * sensitivity;
        targetScrollPosRef.current = Math.max(0, Math.min(HERO_CLIPS.length - 1, newPos));
        velocityRef.current = e.deltaX * sensitivity * 0.4;

        // Debounce snap to clip with directional intent once scrolling pauses
        if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = setTimeout(() => {
          let snapTarget = targetScrollPosRef.current;
          if (Math.abs(velocityRef.current) > 0.003) {
            snapTarget += Math.sign(velocityRef.current) * 0.35;
          }
          const nearest = Math.max(0, Math.min(HERO_CLIPS.length - 1, Math.round(snapTarget)));
          targetScrollPosRef.current = nearest;
          if (nearest !== currentActiveIndexRef.current) {
            currentActiveIndexRef.current = nearest;
            if (onClipChange) onClipChange(nearest);
            syncAudioPlayback(nearest);
          }
        }, 200);
      }
      // Predominantly vertical scrolling bubbles to App.tsx to navigate sections sequentially
    },
    [isActive, onClipChange, onNavigateNext, syncAudioPlayback]
  );

  useEffect(() => {
    if (!isActive) return;
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isActive, handleWheel]);

  // Main 120fps Animation Loop:
  // Directly updates DOM styles for cards (zero React re-render lag) + draws the red theatre canvas
  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure CSS theme variables remain locked to signature red
    document.documentElement.style.setProperty('--reactive-theme-color', '#ff0000');
    document.documentElement.style.setProperty('--reactive-glow-color', 'rgba(255, 0, 0, 0.65)');

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // 1. Mouse Lerp for subtle room parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // 2. 3D Horizontal Scroll Spring Physics (buttery smooth damping, zero sluggish tail)
      const prevScroll = scrollPosRef.current;
      const springK = isDraggingRef.current ? 0.22 : 0.095;
      const diff = targetScrollPosRef.current - scrollPosRef.current;
      if (Math.abs(diff) < 0.001) {
        scrollPosRef.current = targetScrollPosRef.current;
      } else {
        scrollPosRef.current += diff * springK;
      }

      const instantVel = scrollPosRef.current - prevScroll;
      velocityRef.current += (instantVel - velocityRef.current) * 0.25;

      const currentPos = scrollPosRef.current;
      const speed = Math.abs(velocityRef.current);
      // Elastic squash & stretch factors
      const stretchX = 1 + Math.min(0.24, speed * 2.5);
      const squeezeY = 1 - Math.min(0.10, speed * 1.2);

      // Active Clip Sync
      const nearestIdx = Math.max(
        0,
        Math.min(HERO_CLIPS.length - 1, Math.round(currentPos))
      );
      if (nearestIdx !== currentActiveIndexRef.current && !isDraggingRef.current) {
        currentActiveIndexRef.current = nearestIdx;
        if (onClipChange) onClipChange(nearestIdx);
        syncAudioPlayback(nearestIdx);
      }

      // 3. Direct DOM Style Updates for 3D Video Cards (High Performance 120fps + Cinematic Blur)
      HERO_CLIPS.forEach((_, idx) => {
        const card = cardRefs.current[idx];
        const badge = cardBadgeRefs.current[idx];
        if (!card) return;

        const offset = idx - currentPos;
        const absOffset = Math.abs(offset);

        const vid = videoRefs.current[idx];

        if (absOffset > 2.6) {
          card.style.visibility = 'hidden';
          card.style.opacity = '0';
          // Pause distant videos to free hardware decoders so active videos never stutter or freeze
          if (vid && !vid.paused) {
            vid.pause();
          }
          return;
        }
        card.style.visibility = 'visible';

        // Auto-resume playback for near and centered videos so they never get stuck
        if (vid && absOffset <= 1.8 && vid.paused) {
          vid.play().catch(() => {});
        }

        const isCenter = absOffset < 0.4;

        // Enhanced 3D curved cylinder perspective:
        // - Dramatic Z-depth falloff (-Math.pow(absOffset, 0.88) * 320px)
        // - Enhanced 3D Y-rotation curvature (-Math.sign(offset) * Math.min(42, Math.pow(absOffset, 0.9) * 38)deg)
        const cardWidthPercent = 94;
        const translateX = offset * cardWidthPercent;
        const translateZ = -Math.pow(absOffset, 0.88) * 320;
        const rotateY = -Math.sign(offset) * Math.min(42, Math.pow(absOffset, 0.9) * 38);
        const cardStretch = isCenter ? stretchX : 1 + (stretchX - 1) * 0.3;
        const cardSqueeze = isCenter ? squeezeY : 1 - (1 - squeezeY) * 0.3;

        // Cinematic Rack Focus Blur + Velocity-Driven Motion Blur:
        // 1. Motion blur proportional to scrolling speed (applies to all cards while in motion)
        const motionBlurPx = Math.min(22, speed * 60);
        // 2. Depth of field rack focus blur (softens non-centered cards)
        const dofBlurPx = Math.min(14, absOffset * 9.5);
        // 3. Combined blur: dynamic motion blur during high-speed travel, resolving to tack-sharp center at rest
        const totalBlur = Math.min(28, dofBlurPx + motionBlurPx);

        // Directional shutter angle / motion trail shear along velocity vector
        const motionSkew = Math.max(-10, Math.min(10, velocityRef.current * 42));

        const brightness = isCenter ? 1.0 : Math.max(0.42, 1 - absOffset * 0.42);
        const opacity = Math.max(0.28, 1 - absOffset * 0.42);

        card.style.transform = `translate3d(${translateX}%, 0px, ${translateZ}px) rotateY(${rotateY}deg) scaleX(${cardStretch}) scaleY(${cardSqueeze}) skewX(${motionSkew.toFixed(2)}deg)`;
        card.style.opacity = `${opacity}`;
        const effectiveBlur = totalBlur < 0.35 ? 0 : totalBlur;
        card.style.filter = effectiveBlur > 0
          ? `blur(${effectiveBlur.toFixed(1)}px) brightness(${brightness.toFixed(2)})`
          : `brightness(${brightness.toFixed(2)})`;
        card.style.zIndex = `${30 - Math.round(absOffset * 8)}`;

        if (isCenter) {
          card.style.borderColor = 'transparent';
          card.style.borderWidth = '0px';
          card.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.9)';
        } else {
          card.style.borderColor = 'transparent';
          card.style.borderWidth = '0px';
          card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.9)';
        }

        if (badge) {
          badge.style.backgroundColor = isCenter ? '#ff0000' : 'rgba(0, 0, 0, 0.6)';
          badge.style.color = isCenter ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
        }
      });

      // 4. Draw Red Cinema Theatre Room on Canvas
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // 1. Vanishing point and screen center shifted higher to match lifted scroll panel
      const vx = w * 0.5 + (mouseRef.current.x - 0.5) * (w * 0.04);
      const vy = h * 0.44 + (mouseRef.current.y - 0.5) * (h * 0.03);

      // 8. Cinematic Lens Vignette (balanced edge shading preserving ambient red illumination)
      const outerVig = ctx.createRadialGradient(
        vx,
        vy,
        Math.min(w, h) * 0.38,
        vx,
        vy,
        Math.max(w, h) * 0.85
      );
      outerVig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      outerVig.addColorStop(0.65, 'rgba(0, 0, 0, 0.28)');
      outerVig.addColorStop(1, 'rgba(0, 0, 0, 0.80)');
      ctx.fillStyle = outerVig;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, onClipChange, onNavigateNext, syncAudioPlayback]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="w-full h-full absolute inset-0 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
    >
      {/* 0. Auralis WebGL Ambient Background (cinematic radiant red atmosphere) */}
      <Auralis
        colors={["#e61a1a", "#b30000", "#4d0000"]}
        speed={0.32}
        grain={0.60}
        interactive={isActive}
        height="100%"
        className="absolute inset-0 z-0 pointer-events-none opacity-90"
      />

      {/* 1. Transparent Cinema Room Canvas (soft vignette) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-0"
      />

      {/* 2. 3D Perspective Viewport for the Multi-Clip Video Deck (Lifted Higher) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 -translate-y-[6vh]"
        style={{
          perspective: '880px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          className="relative w-full max-w-[820px] h-[352px] max-h-[52vh] flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {HERO_CLIPS.map((clip, idx) => (
            <div
              key={clip.id}
              data-clip-index={idx}
              ref={(el) => (cardRefs.current[idx] = el)}
              onClick={() => {
                targetScrollPosRef.current = idx;
                currentActiveIndexRef.current = idx;
                if (onClipChange) onClipChange(idx);
                syncAudioPlayback(idx);
              }}
              className="absolute w-[64vw] max-w-[820px] aspect-[21/9] rounded-sm overflow-hidden pointer-events-auto cursor-pointer will-change-transform"
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Embedded Video Element */}
              <video
                ref={(el) => (videoRefs.current[idx] = el)}
                src={clip.src}
                loop
                muted
                playsInline
                preload={
                  isActive && Math.abs(idx - activeClipIndex) <= bufferWindow ? 'auto' : 'none'
                }
                crossOrigin="anonymous"
                className="w-full h-full object-cover block"
              />

              {/* 3D Depth & Anamorphic Vignette Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/35" />

              {/* Clip Title Badge */}
              <div className="absolute top-3 left-4 z-10 select-none flex items-center gap-2">
                <span
                  ref={(el) => (cardBadgeRefs.current[idx] = el)}
                  className="text-[11px] font-extrabold tracking-wider px-2 py-0.5 rounded-sm bg-[#ff0000] text-white transition-colors duration-200"
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="text-xs font-bold text-white tracking-widest uppercase drop-shadow">
                  {clip.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

